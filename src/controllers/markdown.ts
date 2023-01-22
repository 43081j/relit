import {marked} from 'marked';
import type {
  ReactiveController,
  ReactiveControllerHost,
  TemplateResult
} from 'lit';
import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

export interface MarkdownOptions<TKey> {
  markedOptions?: marked.MarkedOptions;
  property?: TKey;
}

/**
 * Processes markdown into a HTML result
 */
export class MarkdownController<
  T extends ReactiveControllerHost,
  TKey extends keyof T
> implements ReactiveController
{
  public value?: TemplateResult;

  private __host: T;
  private __options?: MarkdownOptions<TKey>;
  private __previousValue?: string;

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   * @param {MarkdownOptions=} options Options for the controller
   */
  public constructor(host: T, options?: MarkdownOptions<TKey>) {
    this.__host = host;

    if (options) {
      this.__options = options;

      if (options.property) {
        this.__setValueFromProp(options.property);
      }
    }

    host.addController(this);
  }

  /**
   * Sets the value based on a host property
   * @param {string} prop Property containing markdown
   * @return {Promise<void>}
   */
  private async __setValueFromProp(prop: TKey): Promise<void> {
    const value = String(this.__host[prop]);

    if (value !== this.__previousValue) {
      await this.setValue(value);
    }
  }

  /** @inheritdoc */
  public hostUpdate(): void {
    if (this.__options?.property === undefined) {
      return;
    }

    this.__setValueFromProp(this.__options.property);
  }

  /**
   * Sets the markdown value and begins converting it to HTML
   * @param {string} markdown Markdown to parse
   * @return {Promise<void>}
   */
  public async setValue(markdown: string): Promise<void> {
    if (markdown === this.__previousValue) {
      return;
    }

    this.__previousValue = markdown;

    const parsed = marked(markdown, {
      ...this.__options?.markedOptions
    });

    this.value = html`${unsafeHTML(parsed)}`;
    this.__host.requestUpdate();
  }
}
