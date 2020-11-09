// File Imports
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Container } from "reactstrap";
import { fabric } from 'fabric';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faHeading, faImages, faPaintBrush, faParagraph, faSave, faStickyNote, faUpload } from '@fortawesome/free-solid-svg-icons';
import { saveCanvasStatePageChange , saveCanvasState, selectObject } from './app/Helpers';

import BaseCanvas from './features/base/BaseCanvas';
import Toolbar from './features/toolbar/Toolbar';
import Footer from './features/footer/Footer';
import moment from 'moment';

import { selectedItemType } from './app/redux';

import './App.scss';

 
/**
 * Main project class
 *
 * @class App
 * @extends {Component}
 */
class App extends Component {
  constructor(props) {
    super(props);

    this.fileReader = null;
    this.fileReaderRef = React.createRef();
    this.canvasRef = React.createRef();

    this.templatesBackground = [
      require('./assets/template/1.jpg'),
      require('./assets/template/2.jpg'), 
      require('./assets/template/3.jpg'), 
      require('./assets/template/4.jpg'), 
      require('./assets/template/5.jpg'), 
    ];

    // defined json template for front and back
    this.defaultFrontConfig = {"version":"4.2.0","objects":[{"type":"text","version":"4.2.0","originX":"left","originY":"top","left":66,"top":158.93,"width":141.58,"height":85.43,"fill":"#d9e3f0","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeMiterLimit":4,"scaleX":1.53,"scaleY":1.53,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"text":"Front\nBlank","fontSize":35,"fontWeight":"normal","fontFamily":"Open Sans","fontStyle":"normal","lineHeight":1.16,"underline":false,"overline":false,"linethrough":false,"textAlign":"center","textBackgroundColor":"","charSpacing":0,"minWidth":20,"splitByGrapheme":false,"styles":{}}],"background":"#51048f"}
    this.defaultBackConfig = {"version":"4.2.0","objects":[{"type":"text","version":"4.2.0","originX":"left","originY":"top","left":66,"top":158.93,"width":141.58,"height":85.43,"fill":"#d9e3f0","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeMiterLimit":4,"scaleX":1.53,"scaleY":1.53,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"text":"Back\nBlank","fontSize":35,"fontWeight":"normal","fontFamily":"Open Sans","fontStyle":"normal","lineHeight":1.16,"underline":false,"overline":false,"linethrough":false,"textAlign":"center","textBackgroundColor":"","charSpacing":0,"minWidth":20,"splitByGrapheme":false,"styles":{}}],"background":"#51048f"}

    this.state = {
      canvas: null,
      frontCanvasConfig: null,
      backCanvasConfig: null,
      currentSideCard: 'front',
      defaultCanvasWidth: 350,
      defaultCanvasHeight: 450,
      defaultBackgroundImage: this.getRandomImage(), 
      fontBoldValue: 'normal',
      fontItalicValue: '',
      fontUnderlineValue: '',
    };

  }

  componentDidMount() {
  }

  /**
   * update canvas on the state
   * 
   *
   * @memberof App
   */
  updateCanvas = (canvas) => {
    this.setState({
      canvas,
    });
  }

  /**
   * update state options
   * 
   *
   * @memberof App
   */
  updateState = (stateoptions) => {
    this.setState(stateoptions);
  }

  /**
   * get data from canvas and download
   * firstly deselected all item to prevent showing unwanted controller on the image
   *
   * @memberof App
   */
  downloadAsPNG = () => {
    // debug show the fabric edit control on image
    const canvas = this.state.canvas;
    canvas.discardActiveObject().renderAll();
    
    this.props.selectedItemType({ type: '' });

    const time = moment.now();
    const fileName = `${time}.png`;
    const currentCanvasData = this.canvasRef.current;
    const canvasDataUrl = currentCanvasData.toDataURL().replace(/^data:image\/[^;]*/, 'data:application/octet-stream'),
    
    // create dump element to add and trigger event on that
    link = document.createElement('a');
    link.setAttribute('href', canvasDataUrl);
    link.setAttribute('crossOrigin', 'anonymous');
    link.setAttribute('target', '_blank');
    link.setAttribute('download', fileName);

    if (document.createEvent) {
      var evtObj = document.createEvent('MouseEvents');
      evtObj.initEvent('click', true, true);
      link.dispatchEvent(evtObj);
    } else if (link.click) {
      link.click();
    }
  }
 
  /**
   * handel json file after select and read
   *
   * @memberof App
   */
  handleJSONFileRead = (e) => {
    const content = this.fileReader.result;
    const canvas = this.state.canvas;
    canvas.stateaction = false;
    this.removeObjects();

    canvas.loadFromJSON(content,() => {
      canvas.renderAll();
      canvas.stateaction = true;
      saveCanvasState(canvas);
    });

  };
  
  /**
   * handel json file chosen
   *
   * @memberof App
   */
  handleJSONFileChosen = (file) => {
    this.fileReader = new FileReader();
    this.fileReader.onloadend = this.handleJSONFileRead;
    this.fileReader.readAsText(file);
  };

  /**
   * click on hidden file reader by reference
   * 
   *
   * @memberof App
   */
  loadFromJSONSaved = () => {
    this.fileReaderRef.current.click();
  }

  /**
   * download json file of canvas to load with handleJSONFileRead function
   * 
   *
   * @memberof App
   */
  downloadJSONToLoad = () => {
    const time = moment.now()
    const fileName =  `${time}.json`;
    const canvasDataHolder = this.state.canvas.toDatalessJSON();

    var string = JSON.stringify(canvasDataHolder);
    var file = new Blob([string], {
      type: 'application/json'
    });

    var a = document.createElement('a');

    a.href = URL.createObjectURL(file);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
 
  /**
   * delete canvas background and set both bgsrc and bgcolor to null
   * 
   *
   * @memberof App
   */
  deleteCanvasBackground = () => {
    const canvas = this.state.canvas;
    canvas.backgroundColor = '';
    canvas.renderAll();

    const objects = canvas.getObjects().filter(function(currentObject) {
      return currentObject.bg === true;
    });

    for (let i = 0; i < objects.length; i++) {
      canvas.remove(objects[i]);
    }

    canvas.bgsrc = "";
    canvas.bgcolor = "";
  }
 
  /**
   * add new fabric Textbox item by 35 fontsize as heading
   * 
   *
   * @memberof App
   */
  addHeadingText = () => {
    const canvas = this.state.canvas;
    const text = new fabric.Textbox("Heading", {
      fontFamily: 'Open Sans',
      left: 100,
      top: 100,
      type: 'text',
      fontSize: 35,
      width: 120,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    
    
    const selectedType = selectObject(canvas);
    this.props.selectedItemType({ type: selectedType });

    canvas.renderAll();
  }  
   
  /**
   * add new fabric Textbox item by 20 fontsize as paragraph
   * 
   *
   * @memberof App
   */
  addParagraphText = () => {
    const canvas = this.state.canvas;
    const text = new fabric.Textbox("Paragraph", {
      fontFamily: 'Open Sans',
      left: 100,
      top: 100,
      type: 'text',
      fontSize: 20,
      width: 110,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    selectObject(canvas);
    canvas.renderAll();
  }

  /**
   * generate random color and set as background color
   * 
   *
   * @memberof App
   */
  addRandomColorTemplate = () => {
    const canvas = this.state.canvas;
    const randomColor = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
    this.deleteCanvasBackground();
    canvas.backgroundColor = randomColor;
    canvas.renderAll();
    this.setState({
      backgroundColor: randomColor
    });
    saveCanvasState(canvas);
  }
   
  /**
   * select an item randomly from images defined list
   * 
   *
   * @memberof App
   */
  getRandomImage = () => {
    const randomImage = Math.floor(Math.random() * this.templatesBackground.length)
    return this.templatesBackground[randomImage];
  }
   
  /**
   * add random selected image to background
   * 
   *
   * @memberof App
   */
  addRandomImageTemplate = () => {
    const canvas = this.state.canvas;
    let backgroundSourceImage = this.getRandomImage();

    if (backgroundSourceImage && backgroundSourceImage.url) {
      backgroundSourceImage = backgroundSourceImage.url;
    } 

    if (backgroundSourceImage) {
      this.deleteCanvasBackground();
      fabric.Image.fromURL(backgroundSourceImage, (background) => {
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = background.width / background.height;
        let scaleFactor;

        if (canvasAspect >= imgAspect) {
          scaleFactor = canvas.width / background.width * 1;
        } else {
          scaleFactor = canvas.height / background.height * 1;
        }

        background.set({
          originX: 'center',
          originY: 'center',
          opacity: 1,
          selectable: true,
          hasBorders: false,
          hasControls: true,
          hasCorners: true,
          left: canvas.width / 2,
          top: canvas.height / 2,
          scaleX: scaleFactor,
          scaleY: scaleFactor,
          strokeWidth: 0
        });

        canvas.add(background);
        canvas.sendToBack(background);
        background.bg = true;
        canvas.bgsrc = backgroundSourceImage;
        saveCanvasState(canvas);
      });
    }
    
  }

  /**
   * remove selected object/s 
   * 
   *
   * @memberof App
   */
  removeObjects = () => {
    const canvas = this.state.canvas;
    const activeObject = canvas.getObjects();
    canvas.discardActiveObject();

    this.props.selectedItemType({ type: '' });

    canvas.remove(...activeObject);
    saveCanvasState(canvas);
  }

  /**
   * switch to front side of postcard
   * 
   *
   * @memberof App
   */
  frontPostcardAction = () => {
    const currentSideCard = "front";
    if(this.state.currentSideCard === currentSideCard) {
      return;
    }

    const canvas = this.state.canvas;
    const lastState = canvas.state[canvas.state.length - 1]
    const currentCanvas = this.state.frontCanvasConfig || this.defaultFrontConfig
 
    console.log(canvas.state)
    this.setState({
      currentSideCard,
      backCanvasConfig: lastState,
     });

     canvas.stateaction = false;
     this.removeObjects();
     
     canvas.loadFromJSON(currentCanvas, () => {
       canvas.renderAll();
       canvas.stateaction = true;
       saveCanvasStatePageChange(canvas);
    });

  }
 
  /**
   * switch to back side of postcard
   * 
   *
   * @memberof App
   */
  backPostcardAction = () => {
    const currentSideCard = "back";
    if(this.state.currentSideCard === currentSideCard) {
      return;
    }
    const canvas = this.state.canvas;
    let lastState = canvas.state[canvas.state.length - 1];
    const currentCanvas = this.state.backCanvasConfig ||  this.defaultBackConfig
    
    this.setState({
      currentSideCard,
      frontCanvasConfig: lastState,
     });

     canvas.stateaction = false;
     this.removeObjects();
      canvas.loadFromJSON(currentCanvas, () => {
        canvas.renderAll();
        canvas.stateaction = true;
        saveCanvasStatePageChange(canvas);
         
      });
  }
 
  render() {
    const { currentSideCard } = this.state;
 
    return (
      <Container fluid>
        <Row className="navbar-container">
          <Col>
            <nav className="navbar navbar-expand-lg header-bar">
              
              <a className="navbar-brand brand" href="/"> 
              <FontAwesomeIcon icon={faStickyNote} />
              Postcard Editor <sup>Beta</sup></a> {this.props.selectedItemData.type}
            </nav>
          </Col>
          <Col>          
            <nav className="navbar navbar-expand-lg header-bar">
                <ul className="navbar-nav ml-md-auto">

                  <li className="nav-item active heading">
                    <span className="btn btn-outline" onClick={this.addRandomImageTemplate}> <FontAwesomeIcon icon={faImages} title="Add Random Image to Background" /> </span>
                  </li>

                  <li className="nav-item active heading">
                    <span className="btn btn-outline" onClick={this.addRandomColorTemplate}> <FontAwesomeIcon icon={faPaintBrush} title="Add Random Color to Background" /> </span>
                  </li>
                
                  <li className="nav-item separator"> </li>

                  <li className="nav-item active paragraph">
                    <span className="btn btn-outline" onClick={this.addParagraphText}> <FontAwesomeIcon icon={faParagraph} title="Add Paragraph Text" /> </span>
                  </li> 
                  
                  <li className="nav-item active heading">
                    <span className="btn btn-outline" onClick={this.addHeadingText}> <FontAwesomeIcon icon={faHeading} title="Add Heading Text" /> </span>
                  </li>
                
                  <li className="nav-item separator"> </li>

                  <li className="nav-item active save">
                    <span className="btn btn-outline" onClick={this.downloadJSONToLoad}> <FontAwesomeIcon icon={faSave} title="Save Page File to Load" /> </span>
                  </li>
                  <li className="nav-item active load">
                  <input
                      type='file'
                      id='json-load-file'
                      className='file-input-hidden'
                      accept='.json'
                      style={{display: "none"}}
                      ref={this.fileReaderRef}
                      onChange={e => this.handleJSONFileChosen(e.target.files[0])}
                    />
                    <span className="btn btn-outline" onClick={this.loadFromJSONSaved}><FontAwesomeIcon icon={faUpload} title="Load Saved Page" /> </span>
                  </li>

                  <li className="nav-item separator"> </li>
                  <li className="nav-item active download">
                    <span className="btn btn-fill" onClick={this.downloadAsPNG}><FontAwesomeIcon icon={faFileExport} title="Export Current Page" /></span>
                  </li>
                  
                </ul>
            </nav>
          </Col>
        </Row>

        <Row className="main-container">

          <div className="canvas-panel">
            <Toolbar state={this.state} updateCanvas={this.updateCanvas} />

            <BaseCanvas state={this.state} updateCanvas={this.updateCanvas} updateState={this.updateState} canvasReference={this.canvasRef}/>

            <Footer canvas={this.state.canvas}>
            <div className="mid-view">
            <div title="Front Postcard" className="btn-action" onClick={this.frontPostcardAction}>
              <div className={`first ${ (currentSideCard === 'front') ? 'selected' : '' }`} >
              Front Postcard
              </div>
            </div>
            <div className="divider" />
            <div title="Back Postcard" className="btn-action" onClick={this.backPostcardAction}>
              <div className={`second ${ (currentSideCard === 'back') ? 'selected' : '' }`}>
              Back Postcard
              </div>
            </div>
          </div>
            </Footer>
                
          </div>
        </Row>
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

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppContainer;
 