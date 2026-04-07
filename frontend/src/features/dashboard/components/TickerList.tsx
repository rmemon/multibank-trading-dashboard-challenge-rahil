import type { TickerQuote } from "../mock/marketMock";
import { formatUsd } from "../mock/marketMock";

type Props = {
  tickers: TickerQuote[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
};

export function TickerList({ tickers, selectedSymbol, onSelect }: Props) {
  return (
    <div className="ticker-list" role="navigation" aria-label="Instruments">
      <div className="ticker-list__head">
        <h2 className="ticker-list__title">Your watchlist</h2>
        <span className="ticker-list__count">{tickers.length} symbols</span>
      </div>
      <ul className="ticker-list__items">
        {tickers.map((t) => {
          const up = t.changePct >= 0;
          const selected = t.symbol === selectedSymbol;
          return (
            <li key={t.symbol}>
              <button
                type="button"
                className={`ticker-row${selected ? " ticker-row--selected" : ""}`}
                onClick={() => onSelect(t.symbol)}
                aria-pressed={selected}
                aria-current={selected ? "true" : undefined}
              >
                <div className="ticker-row__symbol-block">
                  <span className="ticker-row__symbol">{t.symbol}</span>
                  <span className="ticker-row__name">{t.name}</span>
                </div>
                <div className="ticker-row__price-block">
                  <span className="ticker-row__price tabular">{formatUsd(t.price)}</span>
                  <span className={`ticker-row__chg tabular${up ? " ticker-row__chg--up" : " ticker-row__chg--down"}`}>
                    {up ? "+" : ""}
                    {t.changePct.toFixed(2)}%
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
