import React, { Component } from 'react'
import HighlightText from './HighlightText/HighlightText'
import './HighlightMeWrapper.scss'

class HighlightMeWrapper extends Component {
    state = {
        showHighlighter: false,
        highlightedText: '',
        highlightedObject: null,
        highlightedObjectList: [],
        editHighlight: {},
        hintObjectList: [],
        highlighterPosition: {
            top: 0,
            left: 0
        },
        textHighlighterEnabled: true,
    }

    onMouseUpHandler = (e) => {
        console.log('onMouseUpHandler');
        let isTouchEvent = false
        if (e.nativeEvent instanceof TouchEvent) {
            isTouchEvent = true
        }

        e.preventDefault();
        const selectionObj = (window.getSelection && window.getSelection());
        const selection = selectionObj.toString();

        let getSelectionHtml = () => {
            var html = "";
            if (typeof window.getSelection != "undefined") {
                var sel = window.getSelection();
                if (sel.rangeCount) {
                    var container = document.createElement("div");
                    for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                        container.appendChild(sel.getRangeAt(i).cloneContents());
                    }
                    html = container.innerHTML;
                }
            } else if (typeof document.selection != "undefined") {
                if (document.selection.type == "Text") {
                    html = document.selection.createRange().htmlText;
                }
            }
            return html;
        }

        if (selection !== '') {

            const htmlSelection = getSelectionHtml()

            if (selection !== htmlSelection) {
                console.log("Oops, the system doesn't support mixed content highlights as of now.");
                return
            }

            const anchorNode = selectionObj.anchorNode;
            const focusNode = selectionObj.focusNode;
            const anchorOffset = selectionObj.anchorOffset;
            const focusOffset = selectionObj.focusOffset;
            const position = anchorNode.compareDocumentPosition(focusNode);
            let forward = false;

            if (position === anchorNode.DOCUMENT_POSITION_FOLLOWING) {
                forward = true;
            } else if (position === 0) {
                forward = (focusOffset - anchorOffset) > 0;
            }

            let selectionStart = forward ? anchorOffset : focusOffset;

            if (forward) {
                if (anchorNode.parentNode.getAttribute('data-order')
                    && anchorNode.parentNode.getAttribute('data-order') === 'middle') {
                    selectionStart += this.state.selectionStart;
                }
                if (anchorNode.parentNode.getAttribute('data-order')
                    && anchorNode.parentNode.getAttribute('data-order') === 'last') {
                    selectionStart += this.state.selectionEnd;
                }
            } else {
                if (focusNode.parentNode.getAttribute('data-order')
                    && focusNode.parentNode.getAttribute('data-order') === 'middle') {
                    selectionStart += this.state.selectionStart;
                }
                if (focusNode.parentNode.getAttribute('data-order')
                    && focusNode.parentNode.getAttribute('data-order') === 'last') {
                    selectionStart += this.state.selectionEnd;
                }
            }

            const selectionEnd = selectionStart + selection.length;

            if (e.target.hasAttribute('class')) {
                var cList = e.target.classList;
                cList = cList[0];
            } else {
                var cList = e.target.id;
            }

            let topPosition = e.pageY + 15
            let leftPosition = e.pageX
            if (isTouchEvent) {
                var touch = e.changedTouches[0];
                topPosition = touch.pageY + 15
                leftPosition = touch.pageX
            }

            this.setState({
                showHighlighter: true,
                highlightedText: selection,
                highlighterPosition: {
                    top: topPosition,
                    left: leftPosition
                },
                highlightedObject: {
                    selectionStart,
                    selectionEnd,
                    anchorNode,
                    focusNode,
                    focusNodeText: anchorNode.nodeValue,
                    highlightedText: selection,
                    elementClass: cList,
                }
            })
        } else if (this.state.showHighlighter && !isTouchEvent) {
            // this.setState({
            //     showHighlighter: false,
            //     highlightedText: '',
            //     highlightedObject: null,
            // })
        }
    }

    getContent = () => {
        let { highlightedObjectList } = this.state
        let innerHTML = this.props.content;

        // Add highlights to the HTML content
        if (highlightedObjectList.length) {
            highlightedObjectList.forEach(highlightObj => {
                console.log(highlightObj);
                let start = highlightObj.selectionStart
                let end = highlightObj.selectionEnd
                let { focusNodeText, highlighterColor } = highlightObj

                let index = 0//innerHTML.indexOf(highlightObj.elementClass);
                console.log('index', index);

                if (index >= 0) {
                    let subHTML = innerHTML.substring(index, innerHTML.length)
                    console.log('subHTML', subHTML);

                    let mainContentStartIndex = subHTML.indexOf(focusNodeText)
                    let mainContentEndIndex = mainContentStartIndex + focusNodeText.length
                    let mainContent = subHTML.substring(mainContentStartIndex, mainContentEndIndex)
                    let highlightedText = mainContent.substring(start, end)
                    console.log('highlightedText', highlightedText);
                    console.log('highlightObj.highlightedText', highlightObj.highlightedText);
                    if (highlightedText === highlightObj.highlightedText) {
                        let modifiedMainContent = mainContent.substring(0, start) + `<span class='highlight highlight-${highlighterColor}' name='${start}##${end}'>` + highlightedText + "</span>" + mainContent.substring(end, subHTML.length)
                        let modifiedSubHTML = subHTML.substring(0, mainContentStartIndex) + modifiedMainContent + subHTML.substring(mainContentEndIndex, subHTML.length)

                        innerHTML = innerHTML.substring(0, index) + modifiedSubHTML
                    }
                }
            });
        }

        return innerHTML
    }

    deleteHighlight = () => {
        this.setState({
            highlightedObjectList: [...this.changeListObject(this.state.highlightedObjectList, this.state.highlightedText, this.state.highlightedObject.selectionStart, null, true)],
            editHighlight: {}
        })
        this.closeHighlighter()
    }

    closeHighlighter = () => {
        this.setState({
            showHighlighter: false,
            highlightedText: '',
            highlightedObject: null,
            highlighterPosition: {
                top: 0,
                left: 0
            },
            editHighlight: {},
        })
    }

    changeListObject = (arr, highlightedText, startPosition, newVal, removeValue = false) => {
        var i = arr.length;
        while (i--) {
            if (arr[i]
                && arr[i].hasOwnProperty('highlightedText') && arr[i].hasOwnProperty('selectionStart')
                && (arr[i]['highlightedText'] === highlightedText && arr[i]['selectionStart'] === startPosition)) {

                if (removeValue) {
                    arr.splice(i, 1);
                } else {
                    arr[i] = newVal
                }
            }
        }
        return arr;
    }

    saveHighlight = (highlightObj) => {
        if (highlightObj.highlighterColor) {
            if (this.state.highlightedObjectList.filter(o => o.focusNodeText === this.state.highlightedObject.focusNodeText).length > 0) {
                // Color change of the same highlight
                this.setState({
                    highlightedObjectList: [...this.changeListObject(this.state.highlightedObjectList, this.state.highlightedText, this.state.highlightedObject.selectionStart, {
                        ...this.state.highlightedObject,
                        highlighterColor: highlightObj.highlighterColor,
                    })],
                    editHighlight: Object.keys(this.state.editHighlight).length !== 0 ? { highlighterColor: highlightObj.highlighterColor } : this.state.editHighlight
                })
            } else {
                //Highlight for the first time
                this.setState({
                    highlightedObjectList: [...this.state.highlightedObjectList, {
                        ...this.state.highlightedObject,
                        highlighterColor: highlightObj.highlighterColor,
                    }]
                })
            }
        } else {
            // Highlight removed
            this.setState({
                highlightedObjectList: [...this.changeListObject(this.state.highlightedObjectList, this.state.highlightedText, this.state.highlightedObject.selectionStart, null, true)],
                editHighlight: Object.keys(this.state.editHighlight).length !== 0 ? { highlighterColor: highlightObj.highlighterColor } : this.state.editHighlight
            })
        }
        this.closeHighlighter()
    }

    render() {
        return (
            <div className="highlight-me-wrapper"
                onMouseUp={this.onMouseUpHandler}>

                <div className="highlight-me-content"
                    dangerouslySetInnerHTML={{ __html: this.getContent() }}></div>

                <HighlightText
                    highlighterPosition={this.state.highlighterPosition}
                    showHighlighter={this.state.showHighlighter}
                    saveHighlight={this.saveHighlight}
                    closeHighlighter={this.closeHighlighter}
                    deleteHighlight={this.deleteHighlight}
                    editMode={this.state.editHighlight} />
            </div>
        );
    }
}

export default HighlightMeWrapper;