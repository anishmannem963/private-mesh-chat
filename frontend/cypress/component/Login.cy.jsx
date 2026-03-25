import React from 'react'
import Login from '../../src/Login/Login'

describe('Login Component', () => {
  beforeEach(() => {
    cy.mount(
      <Login 
        onLogin={cy.stub().as('loginStub')} 
        onRegisterClick={cy.stub().as('registerStub')} 
      />
    );
  });

  it('renders the login form correctly', () => {
    cy.contains('h4', 'Login').should('be.visible');
    // Use more general selectors for Material-UI components
    cy.get('input').first().should('be.visible'); // Username input
    cy.get('input[type="password"]').should('be.visible');
    cy.contains('button', 'Sign In').should('be.visible');
    cy.contains('Don\'t have an account?').should('be.visible');
    cy.contains('button', 'Register').should('be.visible');
  });

  it('prevents login with empty fields', () => {
    // Try to login without filling any fields
    cy.contains('button', 'Sign In').click();
    
    // Login function should not be called
    cy.get('@loginStub').should('not.have.been.called');
  });

  it('allows login with valid credentials', () => {
    // Fill in username and password using more reliable selectors
    cy.get('input').first().type('testuser');
    cy.get('input[type="password"]').type('password123');
    
    // Click the login button
    cy.contains('button', 'Sign In').click();
    
    // Verify that onLogin was called
    cy.get('@loginStub').should('have.been.called');
  });

  it('navigates to registration when Register button is clicked', () => {
    // Click the Register button
    cy.contains('button', 'Register').click();
    
    // Verify that onRegisterClick was called
    cy.get('@registerStub').should('have.been.called');
  });

  // Add a debug test to identify correct selectors
  it('debug input fields', () => {
    cy.get('input').then($inputs => {
      cy.log('Number of inputs found:', $inputs.length);
      $inputs.each((index, el) => {
        cy.log(`Input ${index} attributes:`, {
          type: el.type,
          value: el.value,
          placeholder: el.placeholder,
          id: el.id,
          class: el.className
        });
      });
    });
  });
});