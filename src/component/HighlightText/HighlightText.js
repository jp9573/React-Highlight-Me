import React from 'react'
import './HighlightText.scss'

class HighlightText extends React.Component {

    state = {
        highlighterColor: '',
    }

    highlightText = (e) => {
        this.setState({
            highlighterColor: e.target.id.length ? e.target.id : ''
        }, () => {
            this.props.saveHighlight(this.state)
        })

    }

    componentWillReceiveProps(newProps) {
        if (Object.keys(newProps.editMode).length !== 0) {
            // Clicked on already highlighted text
            this.setState({
                ...newProps.editMode,
            })
        } else if (newProps.highlighterPosition !== this.props.highlighterPosition) {
            this.setState({
                highlighterColor: '',
            })
        }
    }

    render() {
        let { top, left } = this.props.highlighterPosition

        return (
            <div className={`note-highlighter ${this.props.showHighlighter ? 'show-highlighter' : 'hidden-highlighter'}`}
                style={{ top, left }}>
                <div className="highlighter-header">
                    <div className='highlighter-color-picker'>
                        <div className='yellow-highlighter' id='yellow' onClick={this.highlightText}>
                            {this.state.highlighterColor === 'yellow' ? <svg viewBox="0 0 512 512" fill="#000" className="selected-highlighter-color">
                                <path fill="#000" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path>
                            </svg> : null}
                        </div>
                        <div className='green-highlighter' id='green' onClick={this.highlightText}>
                            {this.state.highlighterColor === 'green' ? <svg viewBox="0 0 512 512" fill="#000" className="selected-highlighter-color">
                                <path fill="#000" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path>
                            </svg> : null}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default HighlightText