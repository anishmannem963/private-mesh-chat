import React from 'react'
import UserBadge from './UserBadge'

describe('<UserBadge />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<UserBadge user="testUser" status="testStatus" img="vite.svg" />)
  })
})