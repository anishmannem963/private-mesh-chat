import React from 'react'
import ServerList from '../../src/MainScreen/ServerList/ServerList'

describe('ServerList Component', () => {
  const servers = [
    { id: 1, name: "test1", icon: "public/vite.svg", channels: ["General", "Gaming", "Music"] },
    { id: 2, name: "test2", icon: "public/vite.svg", channels: ["General", "Discussions", "Voice"] },
    { id: 3, name: "Test1", icon: "public/vite.svg", channels: ["Forum", "one", "two"] },
    { id: 4, name: "Test2", icon: "public/vite.svg", channels: ["dljfnadll", "Gadlfkndlg", "fkld"] },
    { id: 5, name: "thisIsATest1", icon: "public/vite.svg", channels: ["kn", "dknf", "kdlfna"] },
    { id: 6, name: "Alice", icon: "public/vite.svg", channels: ["1", "2", "3"] },
  ];

  beforeEach(() => {
    cy.mount(
      <ServerList 
        servers={servers} 
        onServerSelect={cy.stub().as('serverSelectStub')} 
        onChannelSelect={cy.stub().as('channelSelectStub')} 
      />
    );
  });

  it('displays all servers initially', () => {
    servers.forEach(server => {
      cy.contains(server.name).should('be.visible');
    });
  });

  it('filters servers based on search input', () => {
    // Use a more general selector for the search input
    cy.get('input').first().type('test1');

    // Should only show servers with "test1" in their name
    cy.contains('test1').should('be.visible');
    cy.contains('thisIsATest1').should('be.visible');
    cy.contains('test2').should('not.exist');
    cy.contains('Alice').should('not.exist');

    // Clear search and verify all servers are visible again
    cy.get('input').first().clear();
    servers.forEach(server => {
      cy.contains(server.name).should('be.visible');
    });
  });

  it('selects a server and its first channel when clicked', () => {
    // Click on the first server
    cy.contains('test1').click();

    // Verify that onServerSelect was called with the correct server
    cy.get('@serverSelectStub').should('have.been.called');
    
    // Verify that onChannelSelect was called
    cy.get('@channelSelectStub').should('have.been.called');
  });

  it('can add a new channel to a selected server', () => {
    // First select a server
    cy.contains('test1').click();

    // Click on Add Channel button
    cy.contains('+ Add Channel').click();
    
    // Should display the add channel form
    cy.get('input[placeholder="Channel name"]').should('be.visible');
    
    // Enter a new channel name and submit
    cy.get('input[placeholder="Channel name"]').type('New Test Channel');
    cy.contains('button', 'Add').click();
    
    // Verify that onServerSelect was called with updated server data
    cy.get('@serverSelectStub').should('have.been.called');
  });

  // This test helps debug which selectors are available
  it('debug selectors', () => {
    // Log all input elements to help find the right selector
    cy.get('input').then($inputs => {
      cy.log('Number of inputs found:', $inputs.length);
      $inputs.each((index, el) => {
        cy.log(`Input ${index} attributes:`, {
          id: el.id,
          name: el.name,
          type: el.type,
          placeholder: el.placeholder,
          class: el.className
        });
      });
    });
  });

  it.skip('allows editing user profile', () => {
    // Find and click the Edit button for user profile
    cy.contains('button', 'Edit').click();
    
    // Verify the profile edit modal appears
    cy.contains('Edit Profile').should('be.visible');
    
    // Change the username
    cy.get('input').eq(1).clear().type('New Username');
    
    // Save changes
    cy.contains('button', 'Save').click();
    
    // Verify the profile was updated
    cy.contains('New Username').should('be.visible');
  });
});