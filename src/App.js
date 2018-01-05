import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import classNames from "classnames";

const ResultItem = ({
  label,
  onCloseClick = () => {
    console.log("on result close click");
  },
  onKeyDown = () => {
    console.log("on result result click");
  },
  onResultClick = () => {console.log("on result result click");}
}) => {
  return (
    <div className="result-option">
     <span className="result-delete" onClick={onCloseClick}>×</span>
     <span className="result-label" onClick={onResultClick}>{label}</span>
    </div>
  );
};

const BACKSPACE = 8;
const DOWN_ARROW = 40;
const UP_ARROW = 38;
const ENTER = 13;
class AutoComplete extends React.Component {
 constructor(props) {
   super(props);
   this.handleControlClick = this.handleControlClick.bind(this);
   this.handleInputChanged = this.handleInputChanged.bind(this);
   this.handleResultItemKeyDown = this.handleResultItemKeyDown.bind(this);
   this.handleKeyPress = this.handleKeyPress.bind(this);
   this.clearSelection = this.clearSelection.bind(this);
   this.state = {
     showResults: false,
     currentSelection: []
   };
 }

 handleControlClick(ev) {
  ev.preventDefault();
  this.inputEl.focus();
  console.log("auto complete click");
 }

handleKeyPress(ev) {
  const {keyCode} = ev;
  switch(keyCode) {
    case BACKSPACE:
    if (this.inputEl.value === "") {
      const { currentSelection = [] } = this.state;
      if (currentSelection.length > 0) {
        this.setState((prevState) => {
          prevState.currentSelection.pop();
          return Object.assign({}, prevState, {
            currentSelection: prevState.currentSelection
          });
        });
      }
    }
    break;
    case DOWN_ARROW:
      if (this.resultsList) {
        this.resultsListItem = this.resultsList.firstElementChild;
        if (this.resultsListItem) {
          this.resultsListItem.focus();
        }
        ev.preventDefault();
      }
    default:
    console.log(keyCode);
    break;
  }
}

 handleInputChanged(ev) {
   if (this.currentTimer) {
     clearTimeout(this.currentTimer);
   }
   const currentVal = this.inputEl.value;
   if (currentVal === "") {
     clearTimeout(this.currentTimer);
     return;
   }
   this.currentTimer = setTimeout(() => {
     console.log(currentVal);
     fetch("http://output.jsbin.com/sihagevubu.json")
      .then(results => results.json())
      .then((data) => {
        if(data) {
          console.log(data);
          const usStates = Object.values(data);
          const filtered = usStates.filter(st => {
            return st.includes(currentVal);
          });
          this.setState({
            showResults: true,
            results: filtered
          });
        } else {
          this.setState({
            showResults: false,
            results: []
          });
        }
      });
   }, 300);
 }

 _clearResultListItemFocus() {
   this.resultsListItem = null;
 }

 _addResultItem(result) {
   this.inputEl.value = "";
   this.inputEl.focus();
   this._clearResultListItemFocus();
   this.setState((prevState, props) => ({
     results: prevState.results,
     showResults: false,
     currentSelection: [...prevState.currentSelection, result]
  }));
 }

clearSelection(option) {
  const newOptions = this.state.currentSelection.filter((opt) => {
    return opt !== option;
  });
  this._clearResultListItemFocus();
  this.setState((prevState, props) => ({
    results: prevState.results,
    showResults: false,
    currentSelection: [...newOptions]
 }));
}

handleResultItemKeyDown(keyCode) {
  switch(keyCode) {
    case DOWN_ARROW:
    if(this.resultsListItem) {
      const nextSibling = this.resultsListItem.nextSibling;
      if (nextSibling) {
        this.resultsListItem = nextSibling;
        this.resultsListItem.focus();
      }
    }
    break;
    case UP_ARROW:
    if(this.resultsListItem) {
      const previousSibling = this.resultsListItem.previousSibling;
      if(previousSibling) {
        this.resultsListItem = previousSibling;
        this.resultsListItem.focus();
      } else {
        this.resultsListItem = null;
        this.inputEl.focus();
      }
    }
    break;
    default:
    console.log(keyCode);
    break;
  }
}

 _renderResultsList() {
   const {results = []} = this.state;

   return (
     <div className="results-list" ref={(resultsList) => {this.resultsList = resultsList;}}>
       {
         results.map((result, index) => {
           return (
             <div className="result-list-item" key={index}
              tabIndex={index}
               onKeyDown={(ev) => {
                const {keyCode} = ev;
                switch(keyCode) {
                  case ENTER:
                  this._addResultItem(result);
                  break;
                  default:
                  this.handleResultItemKeyDown(keyCode);
                  break;
                }
               }}
               onClick={this._addResultItem.bind(this, result)}
               >
               {result}
             </div>
           );
         })
       }
     </div>
   )
 }

 _renderResultOptions() {
  const {currentSelection = []} = this.state;
  return (
    <div className="result-options-list">
      {currentSelection.map((option, index) => {
        return (<ResultItem onCloseClick={this.clearSelection.bind(this, option)} label={option} key={index}/>);
      })}
      <input type="text" className="text-input"
        onKeyDown={this.handleKeyPress}
        onChange={this.handleInputChanged}
        ref={(inputEl) => { this.inputEl = inputEl }} />
    </div>
  );
 }

 render() {
   const {showResults} = this.state;
   const resultsClasses = classNames("results-list");
   return (
     <div className="autocomplete">
       <div className="control" onClick={this.handleControlClick}>
         {this._renderResultOptions()}
       </div>
       {showResults && this._renderResultsList()}
     </div>
   );
 }
}

class App extends Component {
  render() {
    return (
      <div>
        <span>Enter a US State: </span>
        <AutoComplete/>
      </div>
    );
  }
}

export default App;
