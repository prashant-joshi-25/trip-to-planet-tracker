export async function withHandledError<
    F extends (...args: any) => Promise<any>,
>(
    execute: F,
): Promise<ReturnType<F> | { error: string }> {
    try {
        return await execute();
    } catch (err) {
        return {
            error: err.toString(),
        };
    }
}
