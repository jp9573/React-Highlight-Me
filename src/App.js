import React, { Component } from 'react';
import HighlightMeWrapper from './component/HighlightMeWrapper';
import './App.scss';

class App extends Component {

    onHighlightHandler = (listOfHighlights) => {
        console.log(listOfHighlights);
    }

    render() {
        return (
            <div className="container">
                {/* Pass string as content */}
                <HighlightMeWrapper
                    content="Lorem ipsum dolor sit amet consectetur, adipisicing elit. Fugiat omnis iure assumenda illo alias dicta nostrum aperiam, similique molestias suscipit. Reprehenderit vero animi quaerat veniam modi sed dolor nam omnis."
                    onHighlightHandler={this.onHighlightHandler}
                />

                {/* Pass html content as content */}
                <HighlightMeWrapper>
                    <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Distinctio, aperiam. Illo inventore, necessitatibus excepturi asperiores, consequatur alias porro, nostrum laborum delectus omnis neque. Tempora est eum deserunt sed totam reiciendis?</p>
                </HighlightMeWrapper>
            </div>
        )
    }
}

export default App;