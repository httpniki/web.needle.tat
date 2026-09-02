export default class ServerActionException<TData = Record<string, string>> extends Error {
   data?: TData
}
