import React from 'react'
import ServerList from './ServerList'

describe('<ServerList />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<ServerList />)
  })
  it('Server search filters results', () =>{

    cy.mount(<ServerList />)
    cy.get('#serverSearchInput').type('alice')

    cy.get('#serverBadgeHolder').children().should('have.length', 1)

  })
})