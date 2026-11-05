'use client';
import NextLink from 'next/link';
import { usePathname, useRouter, useSearchParams as nextSearchParams, useParams as nextParams } from 'next/navigation';
export function Link({ to, href, children, ...props }) {return <NextLink href={to || href || '/'} {...props}>{children}</NextLink>}
export function NavLink({to,children,className='',...props}) { const pathname=usePathname();return <Link to={to} className={`${className} ${pathname === to?.split('?')[0] ? 'active' : ''}`.trim()} {...props}>{children}</Link> }
export function useNavigate() {const router=useRouter(); return (to) => router.push(to)}
export function useLocation() {const pathname=usePathname(); return { pathname, state: null }}
export function useParams() {return nextParams()}
export function useSearchParams() {const params=nextSearchParams(); const router=useRouter(); const path=usePathname();return [params, next => router.replace(path + (next.toString() ? '?' + next.toString():''),{scroll:false})]}
