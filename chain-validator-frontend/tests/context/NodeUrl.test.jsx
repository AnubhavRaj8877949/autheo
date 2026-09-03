import React from 'react';
import { render, screen } from '@testing-library/react';
import { NodeUrlProvider, useGetNodeUrl } from '../../src/context/NodeUrl';

// Test component to consume the context
const TestConsumer = () => {
    const { nodeUrl, isNodeAdded, setNodeUrl, setIsNodeAdded } = useGetNodeUrl();

    return (
        <div>
            <div data-testid="nodeUrl">{nodeUrl}</div>
            <div data-testid="isNodeAdded">{isNodeAdded.toString()}</div>
            <button onClick={() => setNodeUrl('http://test-node.com')}>Set Node URL</button>
            <button onClick={() => setIsNodeAdded(true)}>Set Node Added</button>
        </div>
    );
};

describe('NodeUrl Context', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('provides default values when no node is in localStorage', () => {
        render(
            <NodeUrlProvider>
                <TestConsumer />
            </NodeUrlProvider>
        );

        expect(screen.getByTestId('nodeUrl')).toHaveTextContent('');
        expect(screen.getByTestId('isNodeAdded')).toHaveTextContent('false');
    });

    it('loads node URL from localStorage on mount', () => {
        localStorage.setItem('node', 'http://localhost:8545');

        render(
            <NodeUrlProvider>
                <TestConsumer />
            </NodeUrlProvider>
        );

        expect(screen.getByTestId('nodeUrl')).toHaveTextContent('http://localhost:8545');
        expect(screen.getByTestId('isNodeAdded')).toHaveTextContent('true');
    });

    it('does not set node URL when localStorage has empty string', () => {
        localStorage.setItem('node', '');

        render(
            <NodeUrlProvider>
                <TestConsumer />
            </NodeUrlProvider>
        );

        expect(screen.getByTestId('nodeUrl')).toHaveTextContent('');
        expect(screen.getByTestId('isNodeAdded')).toHaveTextContent('false');
    });

    it('does not set node URL when localStorage has undefined', () => {
        localStorage.removeItem('node');

        render(
            <NodeUrlProvider>
                <TestConsumer />
            </NodeUrlProvider>
        );

        expect(screen.getByTestId('nodeUrl')).toHaveTextContent('');
        expect(screen.getByTestId('isNodeAdded')).toHaveTextContent('false');
    });

    it('provides setNodeUrl and setIsNodeAdded functions', () => {
        render(
            <NodeUrlProvider>
                <TestConsumer />
            </NodeUrlProvider>
        );

        const setNodeUrlButton = screen.getByText('Set Node URL');
        const setNodeAddedButton = screen.getByText('Set Node Added');

        expect(setNodeUrlButton).toBeInTheDocument();
        expect(setNodeAddedButton).toBeInTheDocument();
    });
});
