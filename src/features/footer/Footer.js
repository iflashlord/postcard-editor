import React from 'react';
import { connect } from 'react-redux';
import { Container } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShare, faReply, faSync, faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons'
import { fabric } from 'fabric';
import { saveCanvasState } from '../../app/Helpers';

import { selectedItemType } from '../../app/redux';

import './Footer.scss';

class Footer extends React.Component {
  state = {
    // savestateaction: true,
    canvasScale: 1,
    canvasRotate: 0,
    canvasView: 'horizontal',
  };

  componentDidMount() {
    this.initKeyboardShortcutEvents();
  }

  /**
   * use stored state data to undo
   *
   * @memberof Footer
   */
  undoAction = () => {
    const canvas = this.props.canvas;
    canvas.stateaction = false;
    let index = canvas.index;
    let state = canvas.state;
    if (index > 0) {
      index -= 1;
      this.removeObjects();
      canvas.loadFromJSON(state[index], function() {
        canvas.renderAll();
        canvas.stateaction = true;
        canvas.index = index;
      });
    }
    else {
      canvas.stateaction = true;
    }
  }

  /**
   * use stored state data to redo
   *
   * @memberof Footer
   */
  redoAction = () => {
    const canvas = this.props.canvas;
    let index = canvas.index;
    const state = canvas.state;
    canvas.stateaction = false;
    if (index < state.length - 1) {
      this.removeObjects();
      canvas.loadFromJSON(state[index + 1], function() {
        canvas.renderAll();
        canvas.stateaction = true;
        index ++;
        canvas.index = index;
      });
    } else {
      canvas.stateaction = true;
    }
  }

  /**
   * remove selected object
   *
   * @memberof Footer
   */
  removeObjects = () => {
    const canvas = this.props.canvas;
    const activatedObject = canvas.getActiveObject();
    if (!activatedObject) {
      return;
    }
    if (activatedObject.type === 'activeSelection') {
      activatedObject.forEachObject(currentObject => {
        canvas.remove(currentObject);
      });
    } else {
      canvas.remove(activatedObject);
    }
  }

  /**
   * zoom the canvas in by setCanvasSize
   *
   * @memberof Footer
   */
  zoomIn = () => {
    if (this.state.canvasScale < 4) {
      const percentage = this.state.canvasScale + 0.25;
      this.setCanvasSize(percentage);
    }
  }

  /**
   * zoom the canvas out by setCanvasSize
   *
   * @memberof Footer
   */
  zoomOut = () => {
    if (this.state.canvasScale > 0.25) {
      const percentage = this.state.canvasScale - 0.25;
      this.setCanvasSize(percentage);
    }
  }
  
  
  /**
   * zoom based on target value divided by 100
   *
   * @memberof Footer
   */
  zoomToPercent = (event) => {
    var percentage = Number(event.target.value) / 100;
    this.setCanvasSize(percentage)
  }

  /**
   * set size to canvas based on the percentage
   *
   * @memberof Footer
   */
  setCanvasSize = (percentage) => {
    const canvas = this.props.canvas;

    canvas.setHeight(canvas.getHeight() * (percentage / this.state.canvasScale));
    canvas.setWidth(canvas.getWidth() * (percentage / this.state.canvasScale));

    const objects = canvas.getObjects();

    for (let i in objects) {

      const scaleX = objects[i].scaleX;
      const scaleY = objects[i].scaleY;

      const left = objects[i].left;
      const top = objects[i].top;

      // keep temporary
      const tempScaleX = scaleX * (percentage / this.state.canvasScale);
      const tempScaleY = scaleY * (percentage / this.state.canvasScale);

      const tempLeft = left * (percentage / this.state.canvasScale);
      const tempTop = top * (percentage / this.state.canvasScale);

      objects[i].scaleX = tempScaleX;
      objects[i].scaleY = tempScaleY;
      objects[i].left = tempLeft;
      objects[i].top = tempTop;
      objects[i].setCoords();
    }

    this.setState({ canvasScale: percentage });
    canvas.renderAll();
  }
  
   
  /**
   * rotate canvas by 90 degree every time
   *
   * @memberof Footer
   */
  rotateCanvas = () => {
    const rotateBy = 90;
    let rotateDegree = rotateBy;
    rotateDegree = (rotateDegree >= 360) ? 0 : rotateDegree;
    
    const canvas = this.props.canvas;

    const radians = fabric.util.degreesToRadians(rotateDegree);
  

    const tempWidth = canvas.getWidth();
    const tempHeight = canvas.getHeight();

    canvas.setWidth(tempHeight);
    canvas.setHeight(tempWidth);

    const canvasCenter = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);

  
    canvas.getObjects().forEach((currentObject) => {
      const objectOrigin = new fabric.Point(currentObject.left, currentObject.top);
      const newLocationPoint = fabric.util.rotatePoint(objectOrigin, canvasCenter, radians);
      currentObject.top = newLocationPoint.y;
      currentObject.left = newLocationPoint.x;
      currentObject.angle += rotateDegree;
      currentObject.setCoords()
    });

    this.setState({ canvasRotate: rotateDegree });
    canvas.renderAll();
    saveCanvasState(canvas);
  }

  
  /**
   * remove selected object
   *
   * @memberof Footer
   */
  removeObject = () => {
    const canvas = this.props.canvas;
    const activeObject = canvas.getActiveObjects();
    if (!activeObject) {
      return;
    }

    canvas.discardActiveObject();

    this.props.selectedItemType({ type: '' });

    canvas.remove(...activeObject);
    saveCanvasState(canvas);
  }

  /**
   * group / un group toggle items
   *
   * @returns
   * @memberof Footer
   */
  groupToggleItems() {
    const canvas = this.props.canvas;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
      return false;
    }
    if (activeObject.type === 'group') {
      activeObject.toActiveSelection();
    } else if (activeObject.type === 'activeSelection') {
      activeObject.toGroup();
    }

    this.props.selectedItemType({ type: activeObject.type });

    canvas.renderAll();
  }

  /**
   * keyboard event to handle shortcuts
   *
   * @memberof Footer
   */
  initKeyboardShortcutEvents = () => {
     document.onkeyup = (e) => {
      e.preventDefault();
      e.stopPropagation();  
      console.log(e)
      
      // delete items CTRL + Delete or Backspace
      if (e.ctrlKey && (e.key === "Delete" || e.key === "Backspace")) {
        this.removeObject();
      }

      if (e.ctrlKey && e.key === "z") {
        this.undoAction();
      }

      // CTRL + Y for redo
      if (e.ctrlKey &&  e.key === "y") {
        this.redoAction();
      }
      
      // CTRL +  - for zoom out
      if (e.ctrlKey && e.key === "-") {
        this.zoomOut();
      }

      // CTRL +  (=) for zoom in
      if (e.ctrlKey &&  e.key === "=") {
        this.zoomIn();
      } 
      
      // CTRL +  9 for rotate
      if (e.ctrlKey &&  e.key === "9") {
        this.rotateCanvas();
      }

      // TODO: Add switch between pages with shortcut
      // CTRL +  1 for front postcard
      // if (e.ctrlKey && e.key === "1") {
      // }

      // // CTRL +  2 for back postcard
      // if (e.ctrlKey &&  e.key === "2") {
      // }

      // CTRL + G for group and/or un group
      if (e.ctrlKey &&  e.key === "g") {
        this.groupToggleItems();
      }
    };
  }


  render() {
    let options = []
    for (let i = 1; i < 17; i ++) {
     options.push(<option key={i} value={i * 25}>{i * 25}%</option>)
    }

    return (
      <Container fluid className="footer" >
        <div className="footer-container">
          <div className="left-view">
            <div title="Undo Action (CTRL + Z)" className="btn-action undoicon" onClick={this.undoAction}>
              <div className="first">
                <FontAwesomeIcon icon={faReply} />
              </div>
            </div>
            <div className="divider" />
            <div title="Redo Action (CTRL + Y)" className="btn-action redoicon" onClick={this.redoAction}>
              <div className="first">
              <FontAwesomeIcon icon={faShare} />
              </div>
            </div>
          </div>
          <div>
            {this.props.children}
          </div>
          <div className="right-view">
            <div className="minus" title="Zoom Out (CTRL + -)" onClick = {this.zoomOut}>
            <FontAwesomeIcon icon={faSearchMinus} />
            </div>
            <div className="select-container">
              <span className="select-arrow fa fa-chevron-down"></span>
              <select className="zoom" onChange={this.zoomToPercent} value={this.state.canvasScale * 100}>
                {options}
                <option value="100">Fit Screen</option>
                <option value="200">Fill Screen</option>
              </select>
            </div>
            <div className="plus" title="Zoom In (CTRL + +)" onClick = {this.zoomIn}>
            <FontAwesomeIcon icon={faSearchPlus} />
            </div>
            <div className="rotate" title="Rotate (CTRL + 9)" onClick = {this.rotateCanvas}>
            <FontAwesomeIcon icon={faSync} />

            </div>
          </div>
        </div>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  selectedItemData: state.selectedItemData,
});

const mapDispatchToProps = {
  selectedItemType,
};

const FooterContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Footer);

export default FooterContainer;