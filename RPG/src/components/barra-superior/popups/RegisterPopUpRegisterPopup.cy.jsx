import React from 'react'
import RegisterPopup from './RegisterPopUp'

describe('<RegisterPopup />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<RegisterPopup />)
  })
})