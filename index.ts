
// Simple functions used throughout
class Utility {
    public static pad = (str: string, num: number, filler: string, start: boolean): string =>
        `${start ? '' : str}${Array(num - str.length).fill(filler[0]).join('')}${start ? str : '' }`;
    public static padStart = (str: string, num: number, filler: string): string => Utility.pad(str, num, filler, true);
    public static padEnd = (str: string, num: number, filler: string): string => Utility.pad(str, num, filler, false);
    public static copy = obj => JSON.parse(JSON.stringify(obj));
    public static printarr = (arr: number[], limit: number, label: string): void => {
        let result: string = '[';
        arr.forEach((item: number, i: number) =>
            result += i > (limit / 2) && i < arr.length - (limit / 2) ?
                (result.endsWith('. . ., ') ? '' : '. . ., ') : `${item}, `
        );
        result += ']';
        console.log(`---------------- ${label} ----------------`);
        console.log(result);
    };
}

// Strings used to identify the types of arrays
enum ArrayTypes {
    RANDOM_ARRAY = 'Random Array',
    ORDERED_ARRAY = 'Sorted Array',
    BACKWARDS_ARRAY = 'Reversed Array'
}
// Strings used to identify the types of sorts
enum SortTypes {
    INSERTION_SORT = 'Insertion Sort',
    MERGE_SORT = 'Merge Sort',
    HEAP_SORT = 'Heap Sort',
    QUICK_SORT = 'Quick Sort',
    COUNTING_SORT = 'Counting Sort',
    RADIX_SORT = 'Radix Sort'
}
// interface used to return a sorted list and the complexity of the sort function
interface SortStats {
    title: SortTypes;
    result: any; // number[];
    complexity: number;
}

// contains all of the sorting methods
class Sort {
    // insertion sort copied from the slides
    public static insertionSort(A: number[]): SortStats {
        let complexity = 0;
        const n = A.length;
        if (n === 1) return <SortStats> {
            title: SortTypes.INSERTION_SORT,
            result: A, complexity: complexity
        };
        for (let index: number = 1; index < n; index++) {
            complexity++;
            const x: number = A[index];
            let j: number = index - 1;
            while (j >= 0 && A[j] > x) {
                complexity++;
                A[j + 1] = A[j];
                j--;
            }
            A[j + 1] = x;
        }
        return <SortStats> {
            title: SortTypes.INSERTION_SORT,
            result: A, complexity: complexity
        };
    }

    // merge function copied from the slides
    private static Merge(A: number[], B: number[], complexity: number): SortStats {
		const C: number[] = [];
        const n = A.length, m = B.length;
        let i = 0, j = 0, k = 0;
        while (i < n && j < m) {
            complexity++;
            if (A[i] <= B[j]) {
                C[k] = A[i];
                i++;
            } else {
                C[k] = B[j]
                j++;
            }
            k++;
        }
        if (i >= n) {
            for (let o: number = 0; o < (n + m) - k; o++) {
                complexity++;
                C[k + o] = B[j + o];
            }
        } else {
            for (let o: number = 0; o < (n + m) - k; o++) {
                complexity++;
                C[k + o] = A[i + o];
            }
        }
		return <SortStats> {
            result: C,
            complexity: complexity
        };
    }

    /*
    1 5 4 7 8 9 6 2
    1 5 4 7, 8 9 6 2
    1 5, 4 7, 8 9, 6 2
    1, 5, 4, 7, 8, 9, 6, 2
    1 5, 4 7, 8 9, 2 6
    1 4 5 7, 2 6 8 9
    1 2 4 5 6 7 8 9
    */
    // merge sort copied from the slides
    public static Mergesort(A: number[], complexity: number): SortStats {
        complexity = complexity === undefined ? 0 : complexity;
        const first = 0;
        const last = A.length;
        if (last > 1) {
            const mid: number = Math.floor((first + last) / 2);
            const lstats = Sort.Mergesort(A.splice(first, mid), complexity);
            const rstats = Sort.Mergesort(A, lstats.complexity);
            const mstats = Sort.Merge(lstats.result, rstats.result, rstats.complexity);
            A = mstats.result;
            complexity = mstats.complexity;
        }
        return <SortStats> {
            result: A,
            complexity: complexity,
            title: SortTypes.MERGE_SORT
        };
    }

    // build max heap copied from the slides
    private static BuildMaxHeap(A: number[], complexity: number): SortStats {
        for (let i: number = Math.floor(A.length / 2); i >= 0; i--) {
            complexity++;
            const stats = Sort.MaxHeapify(A, i, complexity);
            A = stats.result;
            complexity = stats.complexity;
        }
        return <SortStats> {
            result: A,
            complexity: complexity
        };
    }

    // max heapify copied from the slides
    private static MaxHeapify(A: number[], i: number, complexity: number): SortStats {
        const left = (2 * (i + 1)) - 1;
        const right = left + 1;
        let largest = left <= A.length && A[left] > A[i] ? left : i;
        largest = right <= A.length && A[right] > A[largest] ? right : largest;
        if (largest !== i) {
            complexity++;
            const temp = A[i];
            A[i] = A[largest];
            A[largest] = temp;
            const stat = Sort.MaxHeapify(A, largest, complexity);
            complexity = stat.complexity;
        }
        return <SortStats> {
            result: A,
            complexity: complexity
        };
    }

    // heap sort copied from the slides
    public static Heapsort(A: number[]): SortStats {
        const result = [];
        const n = A.length;
        const bmhStats = Sort.BuildMaxHeap(A, 0);
        A = bmhStats.result;
        let complexity = bmhStats.complexity;
        let heapsize = n;
        for (let i: number = n; i > 1; i--) {
            complexity++;
            result.unshift(A[0]);
            A[0] = A[i];
            heapsize--;
            const mhStats = Sort.MaxHeapify(Utility.copy(A).splice(0, heapsize + 1), 0, complexity);
            A = mhStats.result;
            complexity = mhStats.complexity;
        }
        A.forEach(e => result.unshift(e));
        return <SortStats> {
            title: SortTypes.HEAP_SORT,
            result: result, complexity: complexity
        };
    }
    
    // partition copied from the slides
    private static partition(A: number[], p: number, r: number, complexity: number): SortStats {
        const x: number = A[r];
        let i: number = p - 1;
        for (let j: number = p; j <= r - 1; j++) {
            complexity++;
            if (A[j] <= x) {
                i++;
                const temp: number = A[i];
                A[i] = A[j];
                A[j] = temp;
            }
        }
        const temp: number = A[i + 1];
        A[i + 1] = A[r];
        A[r] = temp;
        return <SortStats> {
            complexity: complexity,
            result: {
                A: A,
                q: i + 1
            }
        };
    }
    
    // quick sort copied from the slides
    public static Quicksort(A: number[], p: number, r: number, d: number, complexity: number): SortStats {
        p = p === undefined ? 0 : p;
        r = r === undefined ? A.length - 1 : r;
        d = d === undefined ? 0 : d;
        complexity = complexity === undefined ? 0 : complexity;
        if (p < r) {
            const partitionStats: SortStats = Sort.partition(A, p, r, complexity);
            const result = partitionStats.result;
            const q: number = result.q;
            A = result.A;
            const leftStats = Sort.Quicksort(A, p, q - 1, ++d, partitionStats.complexity);
            const rightStats = Sort.Quicksort(A, q + 1, r, ++d, leftStats.complexity);
            complexity = rightStats.complexity;
            const left: number[] = leftStats.result;
            const right: number[] = rightStats.result;
            A = left.concat(right);
        }
        return <SortStats> {
            title: SortTypes.QUICK_SORT, complexity: complexity,
            result: d === 0 ? A.splice(0, Math.floor(9 / 2) + 1).concat(A.splice(A.length - 9 + Math.floor(9 / 2) + 1)) : A
        };
    }
    
    // counting sort copied from the slides
    public static countingSort(A: number[]): SortStats {
        let complexity = 0;
        const n: number = A.length;
        const k: number = Math.max(...A);
        const B: number[] = [];
        const C: number[] = [];
        for (let i: number = 0; i <= k; i++) {
            complexity++;
            C[i] = 0;
        }
        for (let i: number = 0; i < n; i++) {
            complexity++;
            C[A[i]] = C[A[i]] + 1;
            // C[i] = number of elements equal to i
        }
        for (let i: number = 1; i <= k; i++) {
            complexity++;
            C[i] = C[i] + C[i - 1];
            // C[i] = number of elements less than or equal to i
        }
        for (let j: number = n - 1; j >= 0; j--) {
            complexity++;
            const i = A[j];
            B[C[i] - 1] = A[j];
            C[i] = C[i] - 1;
        }
        return <SortStats> {
            title: SortTypes.COUNTING_SORT,
            result: B, complexity: complexity
        };
    }

    public static RadixSort(A: number[]): SortStats {
        let complexity = 0;
        const d = Math.max(...A.map(v => `${v}`.length));
        for (let i: number = d - 1; i >= 0; i--) {
            const sortStats = Sort.countingSort(A.map(v => Number(Utility.padStart(`${v}`, d, '0')[i])));
            const arr = sortStats.result;
            complexity += sortStats.complexity;
            const sorted = [];
            for (let j = 0; j < arr.length; j++) {
                for (let k = 0; k < A.length; k++) {
                    if (Utility.padStart(`${A[k]}`, d, '0')[i] === `${arr[j]}`) {
                        sorted.push(A.splice(k, 1)[0]);
                        break;
                    }
                }
            }
            A = sorted;
        }
        return <SortStats> {
            title: SortTypes.RADIX_SORT,
            result: A, complexity: complexity
        };
    }

}

// main function
function main() {
    const maxNumber = 1000;
    // initializing ordered, backwards, and random array
    let ordered: number[] = Array(maxNumber).fill(null).map((v, i) => i);
    let backwards: number[] = Utility.copy(ordered).reverse();
    let random: number[] = ((): number[] => {
        const result: number[] = [];
        let nums: number[] = Utility.copy(ordered);
        for (let i: number = maxNumber - 1; i >= 0; i--) {
            const index: number = Math.floor(Math.random() * i);
            result.push(nums[index]);
            nums.splice(index, 1);
        }
        return result;
    })();
    // print arrays to view initial states
    const lim: number = 10;
    Utility.printarr(ordered, lim, 'Ordered');
    Utility.printarr(backwards, lim, 'Backward');
    Utility.printarr(random, lim, 'Random');
    // collect results from the different sorting functions
    const results: { list: string, sort: string, complexity: number }[] = [];
    const collectInfo = (list: number[], limit: number, prefix: string, func: any) => {
        const sort = func;
        const listCopy: number[] = Utility.copy(list);
        const stats: SortStats = sort(listCopy);
        Utility.printarr(stats.result, limit, `${prefix} ${stats.title}`);
        console.log(`Complexity: ${stats.complexity}`);
        results.push({ list: prefix, sort: stats.title, complexity: stats.complexity });
    };
    [ Sort.insertionSort, Sort.countingSort, Sort.Mergesort, Sort.Quicksort, Sort.Heapsort, Sort.RadixSort
    ].forEach(func => {
        collectInfo(ordered, lim, ArrayTypes.ORDERED_ARRAY, func);
        collectInfo(backwards, lim, ArrayTypes.BACKWARDS_ARRAY, func);
        collectInfo(random, lim, ArrayTypes.RANDOM_ARRAY, func);
    });
    Array(4).fill(null).map(() => console.log());
    // print out table of results
    const arrayTypes = Object.keys(ArrayTypes).map(key => ArrayTypes[key]);
    const sortTypes = Object.keys(SortTypes).map(key => SortTypes[key]);
    const cellWidth = 24;
    const cell = str => `${Utility.padStart(str, cellWidth - 4, ' ')}   |`;
    const printLine = callback => {
        console.log(Array(4 * cellWidth).fill('_').join(''));
        callback();
    }
    printLine(() => console.log([''].concat(arrayTypes).map(arrayType => cell(arrayType)).join('')));
    printLine(() => sortTypes.forEach(sortType => {
        let line = cell(sortType);
        arrayTypes.forEach(arrayType => {
            const stat = results.find(r => r.sort === sortType && r.list === arrayType);
            line += cell(`${stat.complexity}`);
        });
        console.log(line);
        printLine(() => undefined);
    }));
}

// run main function
main();
