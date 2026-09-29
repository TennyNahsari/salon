/**
 * Utility to generate pagination page ranges with ellipsis for mobile & web.
 * Example for totalPages=10, currentPage=5:
 * [1, 2, '...', 4, 5, 6, '...', 9, 10]
 */
export function getPaginationRange(currentPage, totalPages, boundaryCount = 2, siblingCount = 1) {
  const totalNumbers = boundaryCount * 2 + siblingCount * 2 + 1; // 7
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > boundaryCount + 1;
  const shouldShowRightDots = rightSiblingIndex < totalPages - boundaryCount;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = boundaryCount + siblingCount * 2 + 1;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    const rightRange = Array.from({ length: boundaryCount }, (_, i) => totalPages - boundaryCount + 1 + i);
    return [...leftRange, '...', ...rightRange];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = boundaryCount + siblingCount * 2 + 1;
    const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + 1 + i);
    const leftRange = Array.from({ length: boundaryCount }, (_, i) => i + 1);
    return [...leftRange, '...', ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const leftRange = Array.from({ length: boundaryCount }, (_, i) => i + 1);
    const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
    const rightRange = Array.from({ length: boundaryCount }, (_, i) => totalPages - boundaryCount + 1 + i);
    return [...leftRange, '...', ...middleRange, '...', ...rightRange];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
}
