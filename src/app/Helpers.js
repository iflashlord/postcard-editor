/**
 * remove duplicate items from the array
 *
 * @export
 * @param {*} dupArray
 * @returns
 */
export function unique(dupArray) {
  return dupArray.reduce(function(previous, num) {
    if (previous.find(function(item) {
        return item === num;
      })) {
      return previous;
    }
    else {
      previous.push(num);
      return previous;
    }
  }, []);
}


/**
 * get offset left and top of the DOM element
 *
 * @export
 * @param {*} el
 * @returns
 */
export function getOffset(el) {
  el = document.getElementById(el);
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}

/**
 * save canvas history as json for undo and redo actions
 *
 * @export
 * @param {*} canvas
 */
export function saveCanvasState(canvas) {
  if (canvas.stateaction && canvas.state) {
    const newState = [];
    let index = canvas.index;
    let state = canvas.state;
    for (let i = 0; i <= index; i++) {
      newState.push(state[i]);
    }
    state = newState;
    var newJSON = JSON.stringify(canvas);
    state[++index] = newJSON;
    if (state.length >= 45) {
      state = state.splice(-5, 5);
    }
    canvas.state = state;
    
    canvas.index = index;
  }
}

export function saveCanvasStatePageChange(canvas) {
  if (canvas.stateaction && canvas.state) {
    const newState = [];
    let index = canvas.index;
    let state = canvas.state;

    // Solve undo problem between pages
    // TODO: separate the sate of pages 
    // current solution is stop undo after change the page
    // for (var i = 0; i <= index; i++) {
    //   newState.push(state[i]);
    // }
    state = newState;
    var newJSON = JSON.stringify(canvas);
    state[index] = newJSON;
    if (state.length >= 45) {
      state = state.splice(-5, 5);
    }
    canvas.state = state;
    canvas.index = index;
  }
}
  
export function selectObject(canvas, activeObject) {
   
    if (canvas) {

      // if there is no active object auto fill it
      if (!activeObject) { 
        activeObject = canvas.getActiveObject();
      }

      // if it's still no selected return
      if (!activeObject) { 
        return false;
      }

      canvas.selectedObject = activeObject;
 
      if (activeObject.type === 'group') {
        activeObject.subTargetCheck = true;
      }
    
      // document.getElementsByClassName("group-items")[0].style.display = "none";
      // document.getElementsByClassName("un-group-items")[0].style.display = "none";

      // if (activeObject.type === 'activeSelection') {
      //   document.getElementsByClassName("group-items")[0].style.display = "block";
      // }
      
      console.log(activeObject.type);
      // setSelectSelectedType(activeObject.type)
      // if (activeObject.type === 'text') {
      //   document.getElementsByClassName("font-size-container")[0].style.display = "block";
      //   document.getElementsByClassName("font-family-container")[0].style.display = "block";
      //   document.getElementsByClassName("font-color-container")[0].style.display = "block";
      //   document.getElementsByClassName("font-style-container")[0].style.display = "block";
      //   document.getElementsByClassName("font-align-container")[0].style.display = "block";
      // }
      // if (activeObject.type === 'path') {
      //   document.getElementsByClassName("font-size-container")[0].style.display = "none";
      //   document.getElementsByClassName("font-family-container")[0].style.display = "none";
      //   document.getElementsByClassName("font-color-container")[0].style.display = "block";
      //   document.getElementsByClassName("font-style-container")[0].style.display = "none";
      //   document.getElementsByClassName("font-align-container")[0].style.display = "none";
      //   document.getElementsByClassName("font-color-container")[0].style.marginLeft = "10px";
      //   document.getElementsByClassName("text-color-picker")[0].style.backgroundColor = activeObject.fill;
      // }
      // if (activeObject.type === 'group') {
      //   document.getElementsByClassName("font-size-container")[0].style.display = "none";
      //   document.getElementsByClassName("font-family-container")[0].style.display = "none";
      //   document.getElementsByClassName("font-color-container")[0].style.display = "block";
      //   document.getElementsByClassName("font-style-container")[0].style.display = "none";
      //   document.getElementsByClassName("font-align-container")[0].style.display = "none";
      //   document.getElementsByClassName("font-color-container")[0].style.marginLeft = "10px";
      //   document.getElementsByClassName("group-items")[0].style.display = "none";
      //   document.getElementsByClassName("un-group-items")[0].style.display = "block";
      //   document.getElementsByClassName("text-color-picker")[0].style.backgroundColor = activeObject.fill ;

      //   activeObject.subTargetCheck = true;
      // }

      // if (activeObject.type === 'image') {
      //   document.getElementsByClassName("font-size-container")[0].style.display = "none";
      //   document.getElementsByClassName("font-family-container")[0].style.display = "none";
      //   document.getElementsByClassName("font-color-container")[0].style.display = "none";
      //   document.getElementsByClassName("font-style-container")[0].style.display = "none";
      //   document.getElementsByClassName("font-align-container")[0].style.display = "none";
      //   document.getElementsByClassName("item-send-back")[0].style.marginLeft = "10px";
      // }
 

      canvas.renderAll();
      
      return activeObject.type;
    }
}