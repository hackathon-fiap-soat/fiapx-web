import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';
import { STATUS_LABELS } from './status';
import { VIDEO_STATUSES } from './types';

describe('StatusBadge', () => {
  it.each(VIDEO_STATUSES)('mostra o texto em português para %s', (status) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(STATUS_LABELS[status])).toHaveAttribute('data-status', status);
  });

  it('PROCESSING tem spinner; os demais, um ponto', () => {
    const { container, rerender } = render(<StatusBadge status="PROCESSING" />);
    expect(container.querySelector('svg.animate-spin')).not.toBeNull();
    rerender(<StatusBadge status="COMPLETED" />);
    expect(container.querySelector('svg')).toBeNull();
  });
});
