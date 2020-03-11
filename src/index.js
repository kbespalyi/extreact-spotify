import React from 'react';
import { render } from 'react-dom';
import './index.scss';
import App from './components/App';
import { ExtReact } from '@sencha/ext-react'
import { launch } from '@sencha/ext-react'
import authenticate from './Authenticate'

const token = authenticate()

launch(
  <ExtReact>
    <App token={token} />
  </ExtReact>
)

window.Spotify = {}
