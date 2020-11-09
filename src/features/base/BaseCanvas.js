import React from 'react';
import { connect } from 'react-redux';
import { fabric } from 'fabric';
import {
  saveCanvasState,
  selectObject
}
from '../../app/Helpers';
import {  faClone, faTrash } from '@fortawesome/free-solid-svg-icons';

import { selectedItemType } from '../../app/redux';

import './BaseCanvas.scss';
 
class BaseCanvas extends React.Component {
  state = {
    subTarget: null
  };

  updateState(e) {
    var stateoptions = {};
    if (e) {
      stateoptions = {
        fontBoldValue: e.target.fontWeight,
        fontItalicValue: e.target.fontStyle,
        fontUnderlineValue: e.target.underline
      }
    }
    this.props.updateState(stateoptions);
  }

  componentDidMount() {

    // create icon base on the fontawsome icons
    const cloneIcon = `data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'   xml:space='preserve'%3E%3Cpath style='fill:%22858c3;' d='${faClone.icon[4]}'/%3E%3C/svg%3E%0A`;
    const deleteIcon = `data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'    xml:space='preserve'%3E%3Cpath style='fill:%2c32424;' d='${faTrash.icon[4]}'/%3E%3C/svg%3E%0A`;
    
    var deleteImg = document.createElement('img');
    deleteImg.src = deleteIcon;
  
    var cloneImg = document.createElement('img');
    cloneImg.src = cloneIcon;
  
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = 'blue';
    fabric.Object.prototype.cornerStyle = 'circle';


    fabric.Object.prototype.controls.deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetY: -16,
      offsetX: 16,
      cursorStyle: 'pointer',
      mouseUpHandler: this.deleteObject,
      render: this.renderIcon(deleteImg),
      cornerSize: 24
    });

    fabric.Object.prototype.controls.clone = new fabric.Control({
      x: -0.5,
      y: -0.5,
      offsetY: -16,
      offsetX: -16,
      cursorStyle: 'pointer',
      mouseUpHandler: this.cloneObject,
      render: this.renderIcon(cloneImg),
      cornerSize: 24
    });
 
  
    // init canvas
    this.canvas = new fabric.Canvas('post-card-canvas', {
      preserveObjectStacking: true,
      width: this.props.state.defaultCanvasWidth,
      height: this.props.state.defaultCanvasHeight,
      
    });

   
    //for canvas history save - undo / redo
    this.canvas.state = [];
    this.canvas.index = 0;
    this.canvas.stateaction = true;
  
    this.initCanvasEvents();
    this.setBackgroundImageToCanvas(this.props.state.defaultBackgroundImage);

    this.props.updateCanvas(this.canvas);
  }

  
   deleteObject = (eventData, target) => {
    const canvas = target.canvas;
    const activeObject = canvas.getActiveObjects();

    if (!activeObject) {
      return;
    }

    canvas.discardActiveObject();
    
    this.props.selectedItemType({ type: '' });

    canvas.remove(...activeObject);
    saveCanvasState(canvas);

  }

   cloneObject = (eventData, target) => {
    const canvas = target.canvas;
    target.clone(function(cloned) {
      cloned.left += 20;
      cloned.top += 20;
      canvas.add(cloned);
    });
  }


  renderIcon = (icon) => {
  return function renderIcon(ctx, left, top, styleOverride, fabricObject) {
    var size = this.cornerSize;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.drawImage(icon, -size/2, -size/2, size, size);
    ctx.restore();
  }
}

  onClickCanvasArea = (e)=> {
    this.canvas.renderAll(); 
    e.stopPropagation();
  }
  

  initCanvasEvents() {

    // double click event for fabric
    fabric.util.addListener(this.canvas.upperCanvasEl, 'dblclick', (e) => {
        if(this.state.subTarget) {

          const selectedType = selectObject(this.canvas, this.state.subTarget);
          this.props.selectedItemType({ type: selectedType });


          this.setState({
            subTarget: null
          });
        }
    });

    this.canvas.on({
      'mouse:down': (e) => {
          if(e.subTargets && e.subTargets[0]) {
            this.setState({
              subTarget: e.subTargets[0]
            });
          }
          
      },                
      'object:moving': (e) => {
        this.updateState(e);
      },
      'object:added': (e) => {
        this.updateState(e);
        saveCanvasState(this.canvas);
      },
      'object:modified': (e) => {
        this.updateState(e);
        saveCanvasState(this.canvas);
      },
      'object:selected': (e) => {
        this.updateState(e);
      },
      'object:scaling': (e) => {
        this.updateState(e);
      },
      'selection:created': (e) => {
        this.updateState();
          if(e.subTargets) {
            let selectedType = selectObject(this.canvas, e.subTargets[0]);
            this.props.selectedItemType({ type: selectedType });
          } else {
            let selectedType = selectObject(this.canvas);
            this.props.selectedItemType({ type: selectedType });
          }
          
      },
      'selection:updated': () => {
        this.updateState();
        let selectedType =selectObject(this.canvas);
        this.props.selectedItemType({ type: selectedType });
      },
      'selection:cleared': () => {
        this.updateState();
        this.props.selectedItemType({ type: '' });
      },
      'selection:added': (e) => {},
    });
  }
 
  deleteCanvasBackground = () => {
    this.canvas.backgroundColor = '';
    this.canvas.renderAll();
    
    const objects = this.canvas.getObjects().filter(function(currentObject) {
      return currentObject.bg === true;
    });

    for (let i = 0; i < objects.length; i++) {
      this.canvas.remove(objects[i]);
    }

    this.canvas.bgsrc = "";
    this.canvas.bgcolor = "";
  }

  setBackgroundImageToCanvas = (result) => {
    var backgroundSource = result;
    if (result && result.url) {
      backgroundSource = result.url;
    }

    if (backgroundSource) {
      this.deleteCanvasBackground();
      fabric.Image.fromURL(backgroundSource, (bg) => {

        const canvasAspect = this.canvas.width / this.canvas.height;
        const imgAspect = bg.width / bg.height;
        let scaleFactor;

        if (canvasAspect >= imgAspect) {
            scaleFactor = this.canvas.width / bg.width * 1;
        } else {
            scaleFactor = this.canvas.height / bg.height * 1;
        }

        bg.set({
            originX: 'center',
            originY: 'center',
            opacity: 1,
            selectable: true,
            hasBorders: false,
            hasControls: true,
            hasCorners: true,
            left: this.canvas.width / 2,
            top: this.canvas.height / 2,
            scaleX: scaleFactor,
            scaleY: scaleFactor,
            strokeWidth: 0
        });

        this.canvas.add(bg);
        this.canvas.sendToBack(bg);
        bg.bg = true;
        this.canvas.bgsrc = backgroundSource;
      });
    }
  }
  
  render() {
    return ( 
      <div className="main-area">
        <div className="canvas-area" onClick={e => this.onClickCanvasArea(e)}>
          <canvas id='post-card-canvas' ref={this.props.canvasReference}>
          </canvas> 
        </div> 
      </div>
    );
  }

}

const mapStateToProps = state => ({
  selectedItemData: state.selectedItemData,
});

const mapDispatchToProps = {
  selectedItemType,
};

const BaseCanvasContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseCanvas);

export default BaseCanvasContainer;