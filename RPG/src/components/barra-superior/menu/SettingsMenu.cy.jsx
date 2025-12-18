import React from 'react'
import SettingsMenu from './SettingsMenu'

describe('<SettingsMenu />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<SettingsMenu />)
  })
})