export interface HttpAdapter {
    get<T>(url: string): Promise<T>
    post(url: string, data: any): Promise<any>
    patch(url: string, data: any): Promise<any>
    delete(url: string): Promise<any>
}