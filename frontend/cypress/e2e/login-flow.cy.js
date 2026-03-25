describe('Login Flow', () => {
    beforeEach(() => {
      cy.visit('/');
    });
  
    it('displays the login form', () => {
      cy.contains('Login').should('be.visible');
      // Use more general selectors for Material-UI components
      cy.get('input').first().should('be.visible'); // Username input
      cy.get('input[type="password"]').should('be.visible');
      cy.contains('button', 'Sign In').should('be.visible');
    });
  
    it('prevents login with empty fields', () => {
      cy.contains('button', 'Sign In').click();
      // We should still be on the login page
      cy.contains('Login').should('be.visible');
    });
  
    it('allows navigation to registration page', () => {
      cy.contains('button', 'Register').click();
      // We should now be on the registration page
      cy.contains('Create an Account').should('be.visible');
    });
  
    it('handles login and displays the main screen', () => {
      // Use more reliable selectors for Material-UI inputs
      cy.get('input').first().type('testuser');
      cy.get('input[type="password"]').type('password123');
      cy.contains('button', 'Sign In').click();
      
      // After successful login, we should see the main screen
      cy.get('div.ColorBox').should('be.visible');
    });
  });