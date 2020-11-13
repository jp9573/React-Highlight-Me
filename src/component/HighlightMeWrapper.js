import React, { Component } from 'react'
import HighlightText from './HighlightText/HighlightText'
import './HighlightMeWrapper.scss'
import ReactDOMServer from 'react-dom/server';

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
                if (document.selection.type === "Text") {
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
            var cList = undefined;

            if (e.target.hasAttribute('class')) {
                cList = e.target.classList;
                cList = cList[0];
            } else {
                cList = e.target.id;
            }

            if (cList == null || cList === 'highlight') {
                // Ignore selection if it is along with the highlight.
                return
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
        let innerHTML = this.props.content || ReactDOMServer.renderToStaticMarkup(this.props.children);

        // Add highlights to the HTML content
        if (highlightedObjectList.length) {
            highlightedObjectList.forEach(highlightObj => {
                let start = highlightObj.selectionStart
                let end = highlightObj.selectionEnd
                let { focusNodeText, highlighterColor } = highlightObj

                let index = 0//innerHTML.indexOf(highlightObj.elementClass);

                if (index >= 0) {
                    let subHTML = innerHTML.substring(index, innerHTML.length)

                    let mainContentStartIndex = subHTML.indexOf(focusNodeText)
                    let mainContentEndIndex = mainContentStartIndex + focusNodeText.length
                    let mainContent = subHTML.substring(mainContentStartIndex, mainContentEndIndex)
                    let highlightedText = mainContent.substring(start, end)
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
        }, this.callOnHighlightListener)
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

    callOnHighlightListener = () => {
        if (typeof this.props.onHighlightHandler === 'function') {
            this.props.onHighlightHandler(this.state.highlightedObjectList)
        }
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
                }, this.callOnHighlightListener)
            } else {
                //Highlight for the first time
                this.setState({
                    highlightedObjectList: [...this.state.highlightedObjectList, {
                        ...this.state.highlightedObject,
                        highlighterColor: highlightObj.highlighterColor,
                    }]
                }, this.callOnHighlightListener)
            }
        } else {
            // Highlight removed
            this.setState({
                highlightedObjectList: [...this.changeListObject(this.state.highlightedObjectList, this.state.highlightedText, this.state.highlightedObject.selectionStart, null, true)],
                editHighlight: Object.keys(this.state.editHighlight).length !== 0 ? { highlighterColor: highlightObj.highlighterColor } : this.state.editHighlight
            }, this.callOnHighlightListener)
        }
        this.closeHighlighter()
    }

    highlightOnClickHandler = (e) => {
        const el = e.target.closest(".highlight");
        if (el && e.currentTarget.contains(el)) {
            const range = e.target.getAttribute('name')
            this.showHighlight(e, range.split('##'))
        }
    }

    showHighlight = (event, range) => {
        let topPosition = event.pageY + 15
        let leftPosition = event.pageX
        if (event.nativeEvent instanceof TouchEvent) {
            var touch = event.changedTouches[0]
            topPosition = touch.pageY + 15
            leftPosition = touch.pageX
        }

        this.state.highlightedObjectList.forEach(highlighObj => {
            if (highlighObj.selectionStart === Number(range[0]) && highlighObj.selectionEnd === Number(range[1])) {

                this.setState({
                    showHighlighter: true,
                    highlightedText: highlighObj.highlightedText,
                    highlighterPosition: {
                        top: topPosition,
                        left: leftPosition
                    },
                    highlightedObject: highlighObj,
                    editHighlight: { highlighterColor: highlighObj.highlighterColor }
                })
            }
        });
    }

    render() {
        return (
            <div className="highlight-me-wrapper"
                onMouseUp={this.onMouseUpHandler}>

                <div
                    className="highlight-me-content"
                    onClick={this.highlightOnClickHandler}
                    onTouchStart={this.highlightOnClickHandler}
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