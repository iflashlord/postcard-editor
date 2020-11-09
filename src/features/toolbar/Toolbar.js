import React from 'react';
import { connect } from 'react-redux';
import { fabric } from 'fabric';
import { TwitterPicker } from 'react-color';
import FontPicker from 'font-picker-react';
import { getOffset, saveCanvasState, selectObject } from '../../app/Helpers'
import { Container } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAlignCenter, faAlignLeft, faAlignRight, faArrowsAltH, faArrowsAltV, faBold, faClone, faFileWord, faImage, faItalic, faLayerGroup, faLevelDownAlt, faLevelUpAlt, faObjectGroup, faTrash, faUnderline } from '@fortawesome/free-solid-svg-icons'
import { faObjectUngroup } from '@fortawesome/free-regular-svg-icons';

import { selectedItemType } from '../../app/redux';

import './Toolbar.scss';

var FontFaceObserver = require('fontfaceobserver');

class Toolbar extends React.Component {
  state = {
    value: '6',
    offsetX: '1',
    offsetY: '1',
    selectedFontFamily: "Open Sans",
    displayColorPicker: false,
    open: false,
    styles: {
      position: 'absolute',
      display: 'none',
    },
  };

  // google font API - it is available on https://developers.google.com/fonts/docs/developer_api
  googleFontAPI = "AIzaSyDY3ApgqXc577xwYnM602gSiEmwROO4zhA";

  textColorRef = React.createRef();

  // selectedItemType = useSelector(wonCount);


  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentWillReceiveProps = (newprops) => {
    const canvas = this.props.state.canvas;
    if (canvas) {
      var activeObject = canvas.getActiveObject();
      var left = getOffset('post-card-canvas').left;
      var top = getOffset('post-card-canvas').top;
      if (activeObject) {
        this.setState({
          styles: {
            top: activeObject.top + top - 50,
            left: activeObject.left + left + activeObject.width * activeObject.scaleX / 2 + 10,
            position: 'fixed',
            display: 'block',
            zIndex: 1000
          }
        });
      } else {
        this.setState({
          styles: {
            display: 'none',
          }
        });
      }
    }
    this.selectObject();
  }

  selectObject = () => {
    const canvas = this.props.state.canvas;
    if (canvas) {

      var activeObject = canvas.getActiveObject();
      if (!activeObject) {
        return false;
      }

      // text
      if (activeObject.type === 'text') {

        this.setState({
          value: activeObject.fontSize,
          selectedFontFamily: activeObject.fontFamily,
        });
  
      }
   
    }

  }
 

  setActiveStyle(styleName, value, object) {
    const canvas = this.props.state.canvas;
    object = object || canvas.getActiveObject();

    if (!object) {
      return;
    }

    if (object.setSelectionStyles && object.isEditing) {
      const style = {};
      style[styleName] = value;
      object.setSelectionStyles(style);
      object.setCoords();
    } else {
      object.set(styleName, value);
    }
    object.setCoords();
    canvas.renderAll();
  }

  setTextFont = (fontFamilySelect) => {
    // let self = this;

    const fontLists = new FontFaceObserver(fontFamilySelect);
    fontLists.load().then( () => {
      this.setActiveStyle('fontFamily', fontFamilySelect);
    }).catch(function (e) {
      console.log(e);
    });

    this.setState({
      selectedFontFamily: fontFamilySelect
    });
  }

  /**
   * set text bold style
   *
   * @memberof Toolbar
   */
  setTextBold = () => {
    var fontBoldValue = (this.props.state.fontBoldValue === "normal") ? "bold" : "normal";
    this.setActiveStyle('fontWeight', fontBoldValue);
    this.props.state.fontBoldValue = fontBoldValue;
  }

  /**
   * set text italic style
   *
   * @memberof Toolbar
   */
  setTextItalic = () => {
    var fontItalicValue = (this.props.state.fontItalicValue === "normal") ? "italic" : "normal";
    this.setActiveStyle('fontStyle', fontItalicValue);
    this.props.state.fontItalicValue = fontItalicValue;
  }

  /**
   * set text underline style
   *
   * @memberof Toolbar
   */
  setTextUnderline = () => {
    var fontUnderlineValue = !this.props.state.fontUnderlineValue ? "underline" : false;
    this.setActiveStyle('underline', fontUnderlineValue);
    this.props.state.fontUnderlineValue = fontUnderlineValue;
  }

  /**
   * set active properties
   *
   * @memberof Toolbar
   */
  setActiveProp = (name, value) => {
    const canvas = this.props.state.canvas;
    const activeObject = canvas.getActiveObject();

    if (!activeObject) {
      return;
    }

    if (activeObject.type === 'activeSelection') {
      activeObject.forEachObject(function (object) {
        object.set(name, value).setCoords();
      });
    } else if (activeObject) {
      activeObject.set(name, value).setCoords();
    }
    canvas.renderAll();
    saveCanvasState(canvas);
  }

  /**
   * align left
   *
   * @memberof Toolbar
   */
  alignObjectLeft = () => {
    this.setActiveProp('textAlign', 'left');
  }

  /**
   * align center
   *
   * @memberof Toolbar
   */
  alignObjectCenter = () => {
    this.setActiveProp('textAlign', 'center');
  }

  /**
   * align right
   *
   * @memberof Toolbar
   */
  alignObjectRight = () => {
    this.setActiveProp('textAlign', 'right');
  }

  /**
   * clear canvas
   *
   * @memberof Toolbar
   */
  clearCanvas = () => {
    const canvas = this.props.state.canvas;
    canvas.clear();
  }

  /**
   * delete selected item
   *
   * @memberof Toolbar
   */
  deleteItem = () => {
    const canvas = this.props.state.canvas;
    const activeObject = canvas.getActiveObjects();
    if (!activeObject) {
      return;
    }
    canvas.discardActiveObject();

    this.props.selectedItemType({ type: '' });

    canvas.remove(...activeObject);
    saveCanvasState(canvas);
  }

  setColor = (color) => {
    this.changeObjectColor(color.hex);
    this.textColorRef.current.style.background = color.hex;
  };

  pickerOpen = () => {
    this.setState({
      displayColorPicker: !this.state.displayColorPicker
    })
  };

  pickerClose = () => {
    this.setState({
      displayColorPicker: false
    })
  };


  changeObjectColor = (hex) => {
    this.changeObjectPropertyStyle('fill', hex);
  }

  changeObjectPropertyStyle(style, hex) {
    const canvas = this.props.state.canvas;
    let currentSelectedObject = canvas.selectedObject;

    if (!currentSelectedObject) {
      currentSelectedObject = canvas.getActiveObject();
    }

    if (currentSelectedObject) {

      if (currentSelectedObject.type === "group") {

        // it is group let's do that for all
        let objects = currentSelectedObject.getObjects();
        for (let i = 0; i < objects.length; i++) {
          this.setActiveStyle(style, hex, objects[i]);
        }


      } else {

        //other text etc.
        this.setActiveStyle(style, hex, currentSelectedObject);
      }

      // TODO: if we support shapes we need to do for all path (currentSelectedObject.path)  in a loop


    } else {

      let groupOfObjects = canvas.getActiveObjects();

      // if it is group of objects
      if (groupOfObjects) {

        groupOfObjects.forEach( (currentObject) => {

          this.setActiveStyle(style, hex, currentSelectedObject);

          // TODO: if we support shapes we need to do for all path (currentObject.paths) in a loop

        });
      }
    }
    canvas.renderAll();
    saveCanvasState(canvas);
  }

  /**
   * set font size value and style
   *
   * @memberof Toolbar
   */
  fontSize = (event) => {
    this.setState({
      value: event.target.value
    });
    this.setActiveStyle('fontSize', event.target.value);
  }


  /**
   * duplicate selected item base on multi or single
   *
   * @memberof Toolbar
   */
  duplicate = () => {
    const canvas = this.props.state.canvas;
    const activeObject = canvas.getActiveObject();

    if (!activeObject) {
      return false;
    }

    if (activeObject.type === 'activeSelection') {
      activeObject.forEachObject((object) => {
        this.duplicateSelectedObject(object);
      });
    } else {
      this.duplicateSelectedObject(activeObject);
    }

  }

  /**
   * duplicate selected object by fabric clone function and add additional distance in duplicate place for both group and single items
   *
   * @memberof Toolbar
   */
  duplicateSelectedObject = (currentActivatedObject) => {
    const canvas = this.props.state.canvas;
    const duplicateDistance = 20;
    canvas.discardActiveObject();
    this.props.selectedItemType({ type: '' });

    if (fabric.util.getKlass(currentActivatedObject.type).async) {

      // single item
      var duplicate = fabric.util.object.clone(currentActivatedObject);

      duplicate.set({
        left: currentActivatedObject.left + duplicateDistance,
        top: currentActivatedObject.top + duplicateDistance
      });
      canvas.add(duplicate);
      saveCanvasState(canvas);

    } else {
      // group of items
      var duplicates = fabric.util.object.clone(currentActivatedObject);
      canvas.add(duplicates.set({
        left: currentActivatedObject.left + duplicateDistance,
        top: currentActivatedObject.top + duplicateDistance
      }));
      saveCanvasState(canvas);

    }
    canvas.requestRenderAll();
  }

  /**
   * bring selected item up in canvas layer z-index order 
   *
   * @memberof Toolbar
   */
  bringSelectedToForward = () => {
    const canvas = this.props.state.canvas;
    const activeObject = canvas.getActiveObject();
    const activeObjectsList = canvas.getActiveObjects();

    if (activeObjectsList) {
      // for group of items
      activeObjectsList.forEach((currentObject) => {
        canvas.bringForward(currentObject);
        canvas.renderAll();
        saveCanvasState(canvas);
      });
    } else {
      // for single
      canvas.bringForward(activeObject);
      canvas.renderAll();
      saveCanvasState(canvas);
    }
  }

  //TODO: Bring to highest top level function is good


  /**
   * bring selected item up in canvas layer z-index order 
   *
   * @memberof Toolbar
   */
  sendSelectedToBackward = () => {
    const canvas = this.props.state.canvas;
    const activeObject = canvas.getActiveObject();
    const activeObjectsList = canvas.getActiveObjects();
    if (activeObjectsList) {
      activeObjectsList.forEach((currentObject) => {
        canvas.sendBackwards(currentObject);
        canvas.renderAll();
        saveCanvasState(canvas);
      });
    } else {
      canvas.sendBackwards(activeObject);
      canvas.renderAll();
      saveCanvasState(canvas);
    }
  }

  //TODO: Send to lowest down level function is good

  /**
   * flip selected items horizontally with setting the flipX to true or false
   *
   * @memberof Toolbar
   */
  flipHorizontal = () => {
    const canvas = this.props.state.canvas;
    const activeObject = canvas.getActiveObject();
    const groupOfObjects = canvas.getActiveObjects();
    if (groupOfObjects) {
      // group of items
      groupOfObjects.forEach((currentObject) => {
        if (currentObject.flipX) {
          currentObject.flipX = false;
        } else {
          currentObject.flipX = true;
        }
        canvas.renderAll();
        saveCanvasState(canvas);
      });
    } else {
      // single item
      if (activeObject.flipX) {
        activeObject.flipX = false;
      } else {
        activeObject.flipX = true;
      }
      canvas.renderAll();
      saveCanvasState(canvas);

    }
  }

  /**
   * flip selected items vertically with setting the flipY to true or false
   *
   * @memberof Toolbar
   */
  flipVertical = () => {
    const canvas = this.props.state.canvas;
    const activeObject = canvas.getActiveObject();
    const groupOfObjects = canvas.getActiveObjects();

    if (groupOfObjects) {
      // group of items
      groupOfObjects.forEach((object) => {

        if (object.flipY) {
          object.flipY = false;
        } else {
          object.flipY = true;
        }

        canvas.renderAll();
        saveCanvasState(canvas);
      });

    } else {
      // single item
      if (activeObject.flipY) {
        activeObject.flipY = false;
      } else {
        activeObject.flipY = true;
      }
      canvas.renderAll();
      saveCanvasState(canvas);
    }
  }

  groupSelectedItems = () => {
    const canvas = this.props.state.canvas;
    if (!canvas.getActiveObject()) {
      return;
    }
    if (canvas.getActiveObject().type !== 'activeSelection') {
      return;
    }
    canvas.getActiveObject().toGroup();
    let selectedType = selectObject(canvas);
    this.props.selectedItemType({ type: selectedType });
    canvas.renderAll();
  }

  unGroupSelectedItems = () => {
    const canvas = this.props.state.canvas;
    if (!canvas.getActiveObject()) {
      return;
    }
    if (canvas.getActiveObject().type !== 'group') {
      return;
    }
    canvas.getActiveObject().toActiveSelection();
    let selectedType = selectObject(canvas);
    this.props.selectedItemType({ type: selectedType });
    canvas.renderAll();
  }

  render() {
    const colorPickerPlaced = {
      position: 'absolute',
      zIndex: '2',
      top: '48px',
      left: '373px',
    }
    const cover = {
      position: 'fixed',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    }

    const { canvas } = this.props.state;
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (!activeObject) {
        return null;
      }
    } else {
      return null;
    }

    return (
      <Container fluid className="toolbar-container">
        
        <div className="left-bar">

        

        {this.props.selectedItemData.type === "text" &&
        <>
         <FontAwesomeIcon icon={faFileWord} className="toolbar-icon"/>
        </>
        }
        
        {this.props.selectedItemData.type === "activeSelection" &&
        <>
         <FontAwesomeIcon icon={faLayerGroup} className="toolbar-icon"/>
         <div className="separator"></div>
        </>
        }        

        {this.props.selectedItemData.type === "group" &&
        <>
         <FontAwesomeIcon icon={faLayerGroup} className="toolbar-icon"/>
         <div className="separator"></div>
        </>
        }

        {this.props.selectedItemData.type === "image" &&
        <>
         <FontAwesomeIcon icon={faImage} className="toolbar-icon"/>
         <div className="separator"></div>
        </>
        }
        

        {this.props.selectedItemData.type === "group"  &&
          <>
          <div className="font-color-container">
              <div className="color-section" onClick={this.pickerOpen}>
                <div ref={this.textColorRef} className="text-color-picker" />
              </div>
            </div>

            {this.state.displayColorPicker
              ? <div style={colorPickerPlaced}>
                <div style={cover} onClick={this.pickerClose} />
                <TwitterPicker color={this.state.background} onChangeComplete={this.setColor} />
              </div>
              : null
            }
          </>
        }

        {this.props.selectedItemData.type === "text" &&
        <>
          <div title="Select Font Family" className="font-family-container font-family">
            <div>
              <FontPicker
                ref={c => this.pickerRef = c}
                apiKey={this.googleFontAPI}
                pickerId="fontPicker"
                selectedFontFamily={this.state.selectedFontFamily}
                limit="20"
                onChange={nextFont => this.setTextFont(nextFont.family)}
              />
            </div>
          </div>

          <div title="Select Font Size" className="font-size-container select-container fontsize">
            <select onChange={this.fontSize} value={this.state.value}>
              <option>6</option>
              <option>8</option>
              <option>10</option>
              <option>12</option>
              <option>14</option>
              <option>16</option>
              <option>18</option>
              <option>21</option>
              <option>24</option>
              <option>28</option>
              <option>32</option>
              <option>36</option>
              <option>42</option>
              <option>48</option>
              <option>56</option>
              <option>64</option>
              <option>72</option>
              <option>80</option>
              <option>88</option>
              <option>96</option>
              <option>100</option>
              <option>110</option>
              <option>200</option>
            </select>

          </div>

          <div className="font-color-container">
            <div className="color-section" onClick={this.pickerOpen}>
              <div ref={this.textColorRef} className="text-color-picker" />
            </div>
          </div>

          {this.state.displayColorPicker
            ? <div style={colorPickerPlaced}>
              <div style={cover} onClick={this.pickerClose} />
              <TwitterPicker color={this.state.background} onChangeComplete={this.setColor} />
            </div>
            : null
          }

          <div className="font-style-container">
            <div title="Bold" onClick={this.setTextBold} className="txtbold">
              <FontAwesomeIcon icon={faBold} />
            </div>
            <div title="Italic" onClick={this.setTextItalic} className="txtitalic">
              <FontAwesomeIcon icon={faItalic} />
            </div>
            <div title="Underline" onClick={this.setTextUnderline} className="txtunder">
              <FontAwesomeIcon icon={faUnderline} />
            </div>
          </div>

          <div className="font-align-container">

            <div title="Left" onClick={this.alignObjectLeft} className="text-left-align">
              <FontAwesomeIcon icon={faAlignLeft} />
            </div>

            <div title="Center" onClick={this.alignObjectCenter} className="text-center-align">
              <FontAwesomeIcon icon={faAlignCenter} />
            </div>

            <div title="Right" onClick={this.alignObjectRight} className="text-right-align">
              <FontAwesomeIcon icon={faAlignRight} />
            </div>

          </div>

          </>
          }
          <div className="layer-container">
            <div title="Send Item Back" onClick={this.sendSelectedToBackward} className="item-send-back">
              <FontAwesomeIcon icon={faLevelDownAlt} />
            </div>
            <div title="Bring Item Forward" onClick={this.bringSelectedToForward} className="item-send-forward ">
              <FontAwesomeIcon icon={faLevelUpAlt} />
            </div>
          </div>

          
          <div className="group-container">
            {this.props.selectedItemData.type === "activeSelection" &&
              <div title="Group Selected (CTRL + G)" onClick={this.groupSelectedItems} className="group-items">
                <FontAwesomeIcon icon={faObjectGroup} />
              </div>
            }

            {this.props.selectedItemData.type === "group" &&
              <div title="UnGroup Selected (CTRL + G)" onClick={this.unGroupSelectedItems} className="un-group-items">
                <FontAwesomeIcon icon={faObjectUngroup} />
              </div>
            }
          </div>
          
          <div className="flip-container">
            <div title="Flip Selected Horizontally" onClick={this.flipHorizontal} className="flip-horizontal">
              <FontAwesomeIcon icon={faArrowsAltH} />
            </div>
            <div title="Flip Selected  Vertically" onClick={this.flipVertical} className="flip-vertical">
              <FontAwesomeIcon icon={faArrowsAltV} />
            </div>
          </div>


        </div>
        <div className="right-bar">
          <div title="Duplicate Selected" className="toolbar-label btn-duplicate" onClick={this.duplicate}>
            <FontAwesomeIcon icon={faClone} />
          </div>
          <div title="Delete (CTRL + DELETE or CTRL + BACKSPACE)" className="btn-delete" onClick={this.deleteItem}>
            <FontAwesomeIcon icon={faTrash} />
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

const ToolbarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Toolbar);

export default ToolbarContainer;