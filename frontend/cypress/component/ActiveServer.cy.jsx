import React from 'react'
import ActiveServer from '../../src/MainScreen/ServerAndMembers/ActiveServer/ActiveServer'

describe('ActiveServer Component', () => {
  const mockServer = { 
    id: 1, 
    name: "test1", 
    icon: "public/vite.svg", 
    channels: ["General", "Gaming", "Music"] 
  };
  
  const mockMessages = [
    { id: 1, user: "Alice", text: "Hello everyone!" },
    { id: 2, user: "Bob", text: "Hi Alice, how are you?" },
  ];

  it('displays a placeholder when no server is selected', () => {
    cy.mount(
      <ActiveServer 
        setVisible={cy.stub().as('setVisibleStub')} 
        selectedServer={null}
        selectedChannel={null}
        messages={[]}
        onChannelSelect={cy.stub().as('channelSelectStub')}
      />
    );
    
    cy.contains('Select a server to start chatting').should('be.visible');
  });

  it('displays the chat interface when a server and channel are selected', () => {
    cy.mount(
      <ActiveServer 
        setVisible={cy.stub().as('setVisibleStub')} 
        selectedServer={mockServer}
        selectedChannel="General"
        messages={mockMessages}
        onChannelSelect={cy.stub().as('channelSelectStub')}
      />
    );
    
    // Check if messages are displayed
    cy.contains('Alice:').should('be.visible');
    cy.contains('Hello everyone!').should('be.visible');
    cy.contains('Bob:').should('be.visible');
    
    // Verify the message input area is shown
    cy.get('input[placeholder="Text Message"]').should('be.visible');
    cy.contains('button', 'Send').should('be.visible');
  });

  it('allows sending messages', () => {
    // Create a spy on console.log to verify message sending
    cy.window().then((win) => {
      cy.spy(win.console, 'log').as('consoleLog');
    });
    
    cy.mount(
      <ActiveServer 
        setVisible={cy.stub().as('setVisibleStub')} 
        selectedServer={mockServer}
        selectedChannel="General"
        messages={mockMessages}
        onChannelSelect={cy.stub().as('channelSelectStub')}
      />
    );
    
    // Type a message
    const testMessage = 'This is a test message';
    cy.get('input[placeholder="Text Message"]').type(testMessage);
    
    // Send the message
    cy.contains('button', 'Send').click();
    
    // Verify console.log was called with the message (as per your implementation)
    cy.get('@consoleLog').should('have.been.calledWith', 'Sending message:', testMessage);
    
    // Verify input is cleared after sending
    cy.get('input[placeholder="Text Message"]').should('have.value', '');
  });
});