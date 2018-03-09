import React, { Component } from 'react';
import ThumbNail from './ThumbNail/ThumbNail';
import ImageDetail from './ImageDetail/ImageDetail';
import Search from './Search/Search';
import Snackbar from 'material-ui/Snackbar';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import './App.css';
const DB_URL = 'http://localhost:3010/images/';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      imageData: [],
      view: 'home',
      largeImageData: '',
      snackbarOpen: false,
      deleteMode: false,
      imagesDelete: []
    }
  }

  componentDidMount() {
    fetch(DB_URL)
    .then(results => {
      if (results.ok) {
        return results.json()
      } else {
        throw new Error('Issue with getting images fetch')
      }
    })
    .then(data => this.setState({ imageData: data }))
    .catch(err => console.log(err))
  }

  changeView(id) {
    fetch(DB_URL + id)
    .then(results => results.json())
    .then(data => {
      this.setState({ 
        view: 'imageDetails',
        largeImageData: data
      })
    })
  }

  goBack() {
    this.setState({ view: 'home' })
  }

  updateImage(newData) {
    fetch(DB_URL + newData.id, {
      method: 'PUT',
      body: JSON.stringify(newData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        this.setState({ 
          snackbarOpen: true
        })
      } else {
        throw new Error('Network response was not ok')
      }
    })
    .catch(err => console.log('Issue with the update fetch: ', err))
  }

  searchCaptions(value) {
    fetch(`${DB_URL}?caption_like=${value}`)
    .then(response => {
      if (response.ok) {
        return response.json()
      } else {
        throw new Error('Issue with caption search fetch')
      }
    })
    .then(data => this.setState({ imageData: data }))
    .catch(err => console.log(err))
  }

  toggleDeleteMode() {
    let { deleteMode } = this.state
    this.setState({ deleteMode: !deleteMode })
  }

  closeSnackBar() {
    this.setState({ snackbarOpen: false })
  }

  clickDelete(imageId) {
    let { imagesDelete } = this.state
    if (imagesDelete.indexOf(imageId) === -1) {
      this.setState({ imagesDelete: [...imagesDelete, imageId] })
    } else {
      let newDeletes = imagesDelete.filter(id => id !== imageId)
      this.setState({ imagesDelete: newDeletes })
    }
  }

  deleteImages() {
    
  }

  renderView() {
    const { view, imageData, largeImageData, snackbarOpen, deleteMode } = this.state
    switch(view) {
      case 'home':
        return (
          <div className='app__home_container'>
            <div className='app__home_controls_container'>
              <Search 
                search={value => this.searchCaptions(value)}
              />
              <div className='app__home_delete_controls'>
                <Toggle
                  style={{ width: '0%' }}
                  label="Delete Mode"
                  labelPosition="right"
                  onToggle={() => this.toggleDeleteMode()}
                  />
                <RaisedButton
                  style={{ marginLeft: '20px' }} 
                  label='Delete Images'
                  disabled={!deleteMode}
                  onClick={() => this.deleteImages()}
                />
              </div>
            </div>
            <div className='app__home_thumbnail_container'>
              {imageData.map((item, id) => (
                <ThumbNail
                  key={id}
                  data={item}
                  deleteMode={deleteMode}
                  clickDelete={imageId => this.clickDelete(imageId)}
                  changeView={imageId => this.changeView(imageId)}
                />
              ))}
            </div>
          </div>
        )
      case 'imageDetails':
        return (
          <div>            
            <ImageDetail
              data={largeImageData} 
              back={() => this.goBack()}
              update={newData => this.updateImage(newData)}
            />
            <Snackbar 
              className='app__imageDetails_snackbar'
              open={snackbarOpen}
              message="Image Caption and Title Updated"
              autoHideDuration={3000}
              onRequestClose={() => this.closeSnackBar()}
            />
          </div>
        )
      default:
        return
    }
  }

  render() {
    console.log(this.state)
    return (
      <div>
        {this.renderView()}
      </div>
    );
  }
}

export default App;
