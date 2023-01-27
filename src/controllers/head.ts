import type {
  ReactiveController,
  ReactiveControllerHost,
  TemplateResult
} from 'lit';
import {render} from 'lit';

const supportedTags: Array<keyof HTMLElementTagNameMap> = [
  'title',
  'base',
  'meta',
  'link',
  'script',
  'noscript',
  'style'
];

/**
 * Manages the `<head>` and other document-level states
 */
export class HeadController implements ReactiveController {
  public titleTemplate?: string;
  public defaultTitle?: string;

  private __host: ReactiveControllerHost;
  private __document: Document;
  private __updateContainer: DocumentFragment;
  private __trackedNodes: WeakSet<Node>;

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   * @param {Document} doc Custom document to observe
   */
  public constructor(
    host: ReactiveControllerHost,
    doc: Document = window.document
  ) {
    this.__host = host;
    this.__document = doc;
    this.__updateContainer = doc.createDocumentFragment();
    this.__trackedNodes = new WeakSet<Node>();

    host.addController(this);
  }

  /** @inheritdoc */
  public hostConnected(): void {
    if (this.defaultTitle) {
      this.setTitle(this.defaultTitle);
    }
  }

  /**
   * Sets the page title
   * @param {string} title Title to set
   * @return {void}
   */
  public setTitle(title: string): void {
    const newTitle = this.titleTemplate
      ? this.titleTemplate.replace('%s', title)
      : title;
    this.__document.title = newTitle;
  }

  /**
   * Updates the document with the given template
   * @param {TemplateResult} template Template to apply
   * @return {void}
   */
  public update(template: TemplateResult): void {
    const doc = this.__document;

    render(template, this.__updateContainer, {host: this.__host});

    // TODO (43081j): maybe instead of nuking it every time we could
    // do some smart diff and only update whats needed?
    // who knows
    this.removeRenderedElements();

    for (const child of this.__updateContainer.children) {
      if (
        supportedTags.includes(
          child.nodeName.toLowerCase() as keyof HTMLElementTagNameMap
        )
      ) {
        this.__updateDocumentFromTemplate(doc, child);
      }
    }
  }

  /**
   * Removes all elements this controller has rendered
   * @return {void}
   */
  public removeRenderedElements(): void {
    const doc = this.__document;
    const children = [...doc.head.children];
    for (const child of children) {
      if (this.__trackedNodes.has(child)) {
        child.remove();
        this.__trackedNodes.delete(child);

        if (child.nodeName === 'TITLE' && this.defaultTitle) {
          this.setTitle(this.defaultTitle);
        }
      }
    }
  }

  /**
   * Updates the document body's attributes
   * @param {Record<string, string>} attribs Attributes to apply
   * @return {void}
   */
  public updateBodyAttr(attribs: Record<string, string | null>): void {
    const node = this.__document.body;
    this.__applyAttributesFromRecord(node, attribs);
  }

  /**
   * Updates the document's HTML tag's attributes
   * @param {Record<string, string>} attribs Attributes to apply
   * @return {void}
   */
  public updateHtmlAttr(attribs: Record<string, string | null>): void {
    const node = this.__document.documentElement;
    this.__applyAttributesFromRecord(node, attribs);
  }

  /**
   * Applies attributes from a record to a given node
   * @param {Element} node Node to update
   * @param {Record<string, string>} attribs Attributes to apply
   * @return {void}
   */
  private __applyAttributesFromRecord(
    node: Element,
    attribs: Record<string, string | null>
  ): void {
    for (const [attr, value] of Object.entries(attribs)) {
      if (value === null) {
        node.removeAttribute(attr);
      } else {
        node.setAttribute(attr, value);
      }
    }
  }

  /**
   * Replaces a given node with a template, or creates it if it doesn't exist
   * @param {Element} parentElement Parent element to append to if the node
   * doesn't exist yet
   * @param {HTMLTitleElement} template Title element to apply
   * @param {Element} existingNode Node to replace, if any
   * @return {void}
   */
  private __replaceOrCreateNodeFromTemplate(
    parentElement: Element,
    template: Element,
    existingNode: Element | null
  ): void {
    const newNode = template.cloneNode(true);
    this.__trackedNodes.add(newNode);

    if (existingNode) {
      existingNode.replaceWith(newNode);
    } else {
      parentElement.appendChild(newNode);
    }
  }

  /**
   * Updates the document's equivalent element for a given template
   * @param {Document} doc Document to update
   * @param {Element} template Template element to use as a source
   * @return {void}
   */
  private __updateDocumentFromTemplate(doc: Document, template: Element): void {
    switch (template.nodeName) {
      case 'TITLE': {
        this.__replaceOrCreateNodeFromTemplate(
          doc.head,
          template,
          doc.head.querySelector('title')
        );
        break;
      }
      case 'BASE': {
        this.__replaceOrCreateNodeFromTemplate(
          doc.head,
          template,
          doc.head.querySelector('base')
        );
        break;
      }
      case 'LINK':
      case 'SCRIPT':
      case 'NOSCRIPT':
      case 'STYLE':
      case 'META': {
        this.__replaceOrCreateNodeFromTemplate(doc.head, template, null);
        break;
      }
    }
  }
}
