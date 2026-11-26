import { useRef } from "react";
import { LuFileText, LuMenu } from "react-icons/lu";
import ExternalLink from "@/components/ui/ExternalLink";
import CommandMenu from "@/components/widgets/CommandMenu";
import { PERSON, SECTIONS } from "@/content/site.ts";

// Text links, not icons: every destination says what it is. On the home page
// they jump within the page; elsewhere they lead back to it. Below 56rem they
// fold into a disclosure that works without JavaScript.
export default function SiteHeader({ onHome }: { onHome: boolean }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const hrefFor = (id: string) => (onHome ? `#${id}` : `/#${id}`);
  const closeMenu = () => menu.current?.removeAttribute("open");

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a className="site-header__home" href={onHome ? "#top" : "/"}>
          {PERSON.name}
          <span className="site-header__role">{PERSON.title}</span>
        </a>

        <nav className="site-nav" aria-label="Primary">
          {SECTIONS.map(({ id, label }) => (
            <a key={id} href={hrefFor(id)}>
              {label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          <ExternalLink className="button button--quiet button--compact site-header__resume" href={PERSON.links.resume}>
            <LuFileText className="icon" aria-hidden="true" />
            Resume
          </ExternalLink>
          <CommandMenu onHome={onHome} />
          <details className="site-menu" ref={menu}>
            <summary className="button button--quiet button--compact" aria-label="Menu">
              <LuMenu className="icon" aria-hidden="true" />
            </summary>
            <ul>
              {SECTIONS.map(({ id, label }) => (
                <li key={id}>
                  <a href={hrefFor(id)} onClick={closeMenu}>
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <ExternalLink href={PERSON.links.resume}>
                  <LuFileText className="icon" aria-hidden="true" />
                  Resume
                </ExternalLink>
              </li>
            </ul>
          </details>
        </div>
      </div>
    </header>
  );
}
