import * as React from "react"

export const postFlutterMessage = <T>(name: string, data: T) => {
  // @ts-ignore
  if (typeof flutterObject !== "undefined" && flutterObject) {
    const postInfo = JSON.stringify({ name, data })
    // @ts-ignore
    flutterObject.postMessage(postInfo)
  }
}

export const useHandleConnectionData = (
  cb?: (event: { data: string }) => void
) => {
  React.useEffect(() => {
    // @ts-ignore
    if (typeof flutterObject !== "undefined" && flutterObject && cb) {
      // @ts-ignore
      flutterObject.addEventListener("message", cb)

      // Cleanup function (equivalent to onUmounted in Vue)
      return () => {
        // @ts-ignore
        flutterObject.removeEventListener("message", cb)
      }
    }
  }, [cb])
}
