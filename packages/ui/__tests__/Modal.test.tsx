import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../src/components/layout/Modal';

describe('UI Component - Modal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <Modal open={false} onClose={jest.fn()}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('renders title and children when open', () => {
    render(
      <Modal open={true} title="Modal Title" onClose={jest.fn()}>
        <p>Modal Body</p>
      </Modal>
    );

    expect(screen.getByText('Modal Title')).toBeInTheDocument();
    expect(screen.getByText('Modal Body')).toBeInTheDocument();
  });

  it('supports isOpen prop as alias to open', () => {
    render(
      <Modal isOpen={true} title="Alias Open" onClose={jest.fn()}>
        <p>Modal Content</p>
      </Modal>
    );

    expect(screen.getByText('Alias Open')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(
      <Modal open={true} title="Test Modal" onClose={handleClose}>
        <div>Content</div>
      </Modal>
    );

    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = jest.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        <div>Content</div>
      </Modal>
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on other key presses', () => {
    const handleClose = jest.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        <div>Content</div>
      </Modal>
    );

    fireEvent.keyDown(window, { key: 'Enter' });
    expect(handleClose).not.toHaveBeenCalled();
  });
});
