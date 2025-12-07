/**
 * Simple implementation of TOON (Token-Oriented Object Notation)
 * Focuses on converting JSON to TOON for token optimization.
 */

export const toTOON = (data: any, indentLevel = 0): string => {
    const indent = '  '.repeat(indentLevel);

    if (data === null) return 'null';
    if (typeof data === 'undefined') return 'null';

    if (typeof data !== 'object') {
        return JSON.stringify(data);
    }

    // Arrays
    if (Array.isArray(data)) {
        if (data.length === 0) return '[]';

        // Check if it's a list of primitives
        const isPrimitiveList = data.every(item => typeof item !== 'object' || item === null);
        if (isPrimitiveList) {
            return `[${data.length}]: ` + data.map(v => JSON.stringify(v)).join(',');
        }

        // Check if it's a structured list (Table) - Array of Objects with same keys
        const firstKeys = data[0] ? Object.keys(data[0]).sort().join(',') : '';
        const isTable = data.every(item =>
            typeof item === 'object' &&
            item !== null &&
            !Array.isArray(item) &&
            Object.keys(item).sort().join(',') === firstKeys
        );

        if (isTable && data.length > 0) {
            const keys = Object.keys(data[0]);
            const header = `[${data.length}]{${keys.join(',')}}:`;
            const rows = data.map((item: any) =>
                keys.map(k => {
                    const val = item[k];
                    // Simple CSV-like escaping for values in table
                    if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
                    return val;
                }).join(',')
            );
            // For very long tables, we might want newlines, but TOON spec often implies compact single block or newlines.
            // We'll use newlines for readability if it's a root property, but let's stick to the spec examples.
            // Often tabular data is: key[2]{a,b}: 1,2 3,4
            return header + ' ' + rows.join(' ');
        }
    }

    // Standard Object
    const lines: string[] = [];
    for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
            // Handle array value property
            if (value.length === 0) {
                lines.push(`${indent}${key}: []`);
                continue;
            }

            // Check primitive list
            const isPrimitiveList = value.every(item => typeof item !== 'object' || item === null);
            if (isPrimitiveList) {
                lines.push(`${indent}${key}[${value.length}]: ${value.map(v => JSON.stringify(v)).join(',')}`);
                continue;
            }

            // Check Table
            const firstKeys = value[0] ? Object.keys(value[0]).sort().join(',') : '';
            const isTable = value.every(item =>
                typeof item === 'object' &&
                item !== null &&
                !Array.isArray(item) &&
                Object.keys(item).sort().join(',') === firstKeys
            );

            if (isTable && value.length > 0) {
                const keys = Object.keys(value[0]);
                lines.push(`${indent}${key}[${value.length}]{${keys.join(',')}}:`);
                // Indent the rows for readability? Or keep simpler?
                // Spec: users[2]{id,name}: 1,Alice 2,Bob
                const rows = value.map((item: any) =>
                    keys.map(k => {
                        const val = item[k];
                        // If string contains comma or space, quote it
                        if (typeof val === 'string' && (val.includes(',') || val.includes(' '))) return `"${val}"`;
                        return val;
                    }).join(',')
                ).join(' ');
                lines[lines.length - 1] += ' ' + rows;
            } else {
                // Mixed array or complex objects not uniform
                lines.push(`${indent}${key}:`);
                value.forEach((v) => {
                    lines.push(toTOON(v, indentLevel + 1)); // This recurses but might lose the array visual structure if not careful.
                    // Simplified: just JSON stringify complex mixed arrays for now to maintain safety
                    // or implementing full recursive list syntax: - item
                });
            }
        } else if (typeof value === 'object' && value !== null) {
            lines.push(`${indent}${key}:`);
            lines.push(toTOON(value, indentLevel + 1));
        } else {
            lines.push(`${indent}${key}: ${JSON.stringify(value)}`);
        }
    }
    return lines.join('\n');
};
