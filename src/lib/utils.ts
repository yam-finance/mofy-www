export function clickOutside(node, onEventFunction) {
	const handleClick = (event) => {
		var path = event.composedPath();

		if (!path.includes(node)) {
			onEventFunction();
		}
	};

	document.addEventListener('click', handleClick);

	return {
		destroy() {
			document.removeEventListener('click', handleClick);
		}
	};
}

export function binarySearch(array: object[], target: number) {
	return binarySearchHelper(array, target, 0, array.length - 1);
}

function binarySearchHelper(
	array: Record<string, unknown>[],
	target: number,
	left: number,
	right: number
): number {
	if (left > right) return -1;

	const middle = Math.floor((left + right) / 2);
	const potentialMatch = array[middle]['id'];

	if (target === potentialMatch) {
		return middle;
	} else if (target < potentialMatch) {
		return binarySearchHelper(array, target, left, middle - 1);
	} else {
		return binarySearchHelper(array, target, middle + 1, right);
	}
}
