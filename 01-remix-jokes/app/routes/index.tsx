import type { LinksFunction } from "remix"
import styleUrl from "../styles/index.css"

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styleUrl }]
}

export default function IndexRoute() {
    return <div>Hello Index Route</div>
}