// From https://stackoverflow.com/a/76258707/1749551
export const deepMerge = (obj1, obj2) => {
    const clone1 = structuredClone(obj1);
    const clone2 = structuredClone(obj2);

    for (let key in clone2) {
        if (clone2[key] instanceof Object && clone1[key] instanceof Object) {
            clone1[key] = deepMerge(clone1[key], clone2[key]);
        } else {
            clone1[key] = clone2[key];
        }
    }

    return clone1;
};

