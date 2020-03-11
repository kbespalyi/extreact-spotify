import React, { Component } from 'react';
import { Panel } from '@sencha/ext-modern'
import Thumbnail from './thumbnails/Thumbnail'
import Album from './albums/Album'

import './App.scss';

export default class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      album: null
    }

    this.store = Ext.create('Ext.data.Store', {
      fields: [
        {
          name: 'image',
          mapping: 'images[1]'
        }
      ],
      proxy: {
          type: 'ajax',
          url: 'https://api.spotify.com/v1/browse/new-releases',
          reader: {
              type: 'json',
              rootProperty: 'albums.items'
          }
      },
      autoLoad: true
    })

    this.onChildTap = this.onChildTap.bind(this)

    window.Spotify[this.constructor.name] = this;
  }

  render() {
    return (
      <Panel title="Spotify new releases" layout="fit">
        <Thumbnail store={this.store} onChildTap={this.onChildTap} />
        <Album album={this.state.album} onUnselect={() => this.setState({ album: null })} />
      </Panel>
    )
  }

  onChildTap(dataview, location) {
    this.setState({
      album: location.record
    })
  }

}
