/**
 * @jest-environment jsdom
 */

describe('Simple Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle DOM elements', () => {
    document.body.innerHTML = '<div id="test">Test</div>';
    const element = document.getElementById('test');
    expect(element.textContent).toBe('Test');
  });

  it('should mock localStorage', () => {
    localStorage.setItem('test', 'value');
    expect(localStorage.getItem('test')).toBe('value');
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });
}); 