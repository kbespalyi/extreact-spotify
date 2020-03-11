import React, { Component } from 'react';
import { Dialog, Container, Grid, Column, Audio } from '@sencha/ext-modern'
import { Polar } from '@sencha/ext-charts'
import "./Album.scss";

export default class Album extends Component {

  categories = [
    'acousticness',
    'instrumentalness',
    'danceability',
    'speechiness',
    'valence',
    'energy'
  ]

  constructor(props) {
    super(props)

    this.state = {
      album: props.album
    }

    this.audio = React.createRef()

    this.store = Ext.create('Ext.data.Store', {
      proxy: {
          type: 'ajax',
          reader: {
              type: 'json',
              rootProperty: 'tracks.items'
          }
      }
    })

    this.emptyAudioFeatures = this.categories.map((category) => ({category, value: 0}))
    this.audioFeatureStore = new Ext.data.Store({
      data: this.emptyAudioFeatures
    })

    window.Spotify[this.constructor.name] = this;
  }

  componentDidUpdate(prevProps) {
    if (this.props.album !== prevProps.album) {
      if (this.props.album) {
        this.setState({
          album: this.props.album
        })
        this.store.load({
          url: this.props.album.data.href
        })
      } else {
        this.setState({
          album: null
        })
      }
    }
  }

  onSelect(grid, records) {
    const record = records[0]
    if (record && record.data && record.data.preview_url) {
      this.onHandleStart(record)
    } else {
      this.onHandleStop()
    }
  }

  fetchAudioFeatures(trackId) {
    Ext.Ajax.request({
      url: `https://api.spotify.com/v1/audio-features/${trackId}`,
 
      success: (response, opts) => {
          const obj = Ext.decode(response.responseText);
          const data = this.categories.map((category) => ({category, value: obj[category]}))
          this.audioFeatureStore.setData(data)
      },
 
      failure: (response, opts) => {
          console.log('server-side failure with status code ' + response.status);
      }
    })
  }
  
  onHandleStart(record) {
    const audioCmp = this.audio.current.cmp
    audioCmp.setUrl(record.data.preview_url)
    audioCmp.enable()
    audioCmp.play()

    this.fetchAudioFeatures(record.data.id)
  }

  onHandleStop() {
    const audioCmp = this.audio.current.cmp
    audioCmp.stop()
    audioCmp.setUrl(null)
    audioCmp.disable()
  }
 
  render() {
    return (
      <Dialog
        cls="album-dialog"
        displayed={!!this.state.album}
        title={this.state.album ? this.state.album.data.name : ''}
        closable
        closeAction="hide"
        maskTapHandler={(dialog => dialog.hide())}
        width={700}
        height={400}
        onHide={() => {
          this.setState({ album: null })
          this.props.onUnselect()
          this.onHandleStop()
          this.audioFeatureStore.setData(this.emptyAudioFeatures)
        }}
        layout={{
          type: 'hbox'
        }}
      >
        <Grid flex={1} store={this.store} hideHeaders={true}
          onSelect={this.onSelect.bind(this)}
        >
          <Column text="Name" dataIndex="name" flex="1"/>
          <Column text="Duration" dataIndex="duration_ms" width={80} align="center" renderer={
            (ms) => {
              const minutes = Math.floor(ms / 1000 / 60)
              const seconds = Math.floor(ms / 1000) % 60
              return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            }
          }/>
        </Grid>
        <Container flex={1} layout="vbox"> 
          <Audio ref={this.audio} disabled={true} />
          <Polar flex={1}
            store={this.audioFeatureStore}
            insetPadding={20}
            theme="green"
            interactions={['rotate']}
            series={[{
                type: 'radar',
                angleField: 'category',
                radiusField: 'value',
                style: {
                    fillStyle: 'lightblue',
                    fillOpacity: .8,
                    strokeStyle: '#388FAD',
                    strokeOpacity: .8,
                    lineWidth: 1
                }
            }]}
            axes={[{
                type: 'numeric',
                position: 'radial',
                fields: 'value',
                style: {
                    estStepSize: 10
                },
                minimum: 0,
                maximum: 1,
                grid: true
            }, {
                type: 'category',
                position: 'angular',
                fields: 'category',
                style: {
                    estStepSize: 1
                },
                grid: true
            }]}
          />
        </Container>
        
      </Dialog>
    )
  }
}
