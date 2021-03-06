import React from 'react';
import { launch } from '@sencha/ext-react';
import { ExtReact } from '@sencha/ext-react';
import App from './components/App';
import authenticate from './Authenticate'
import './index.scss';

const token = authenticate()

launch(
  <ExtReact>
    <App token={token} />
  </ExtReact>
)

window.Spotify = {}
