const observeStickies = () => {
  const stickies = document.querySelectorAll(".page__header");

  if (!stickies?.length) {
    return;
  }

  var observer = new IntersectionObserver(
    ([el]) => {
      el?.target.__sticker.classList.toggle(
        "stuck",
        el.intersectionRatio === 0
      );
    },
    {
      threshold: 1,
    }
  );

  stickies.forEach((el) => {
    const stickyChecker = document.createElement("div");
    stickyChecker.style.position = "absolute";
    stickyChecker.style.visibility = "hidden";
    stickyChecker.__sticker = el;

    el.before(stickyChecker);

    observer.observe(stickyChecker);
  });
};

const instrumentsFilter = () => {
  const instruments = document.querySelector(".instruments");
  const items = instruments?.querySelectorAll(".instruments__item");
  const filter = instruments?.querySelector(".instruments-filter__filters");
  const taggedElements = instruments?.querySelectorAll(
    ".instruments .instruments__item"
  );

  if (!instruments || !items?.length || !filter || !taggedElements?.length) {
    return;
  }

  const tags = [...taggedElements].map((el) => el.dataset.tag);
  const uniqueTags = [...new Set(tags)];

  uniqueTags.forEach((tag) => {
    const button = document.createElement("button");
    button.className = "instruments-filter__filter";
    button.innerHTML = tag;
    button.dataset.tag = tag;
    filter.append(button);
    button.onclick = () => {
      filterTag(tag);
    };
  });

  const filterItems = filter.querySelectorAll(".instruments-filter__filter");

  const filterTag = (tag) => {
    filterItems.forEach((item) => {
      item.classList.remove("active");

      if (item.dataset.tag === tag) {
        item.classList.add("active");
      }
    });

    items.forEach((item) => {
      item.classList.remove("hide");

      if (tag && item.dataset.tag !== tag) {
        item.classList.add("hide");
      }
    });
  };

  filterItems[0].onclick = () => filterTag();
};

const menuToggler = () => {
  const toggle = document.querySelector(".page-header-menu__toggle");

  if (!toggle) {
    return;
  }

  toggle.onclick = (e) => {
    const el = e.target.closest(".page-header-menu");
    el?.classList.toggle("show");
    document.documentElement.classList[
      [...el?.classList].includes("show") ? "add" : "remove"
    ]("open-menu");
  };

  window.addEventListener("click", (e) => {
    if (e.target.closest(".page-header-links__link")) {
      e.target.closest(".page-header-menu")?.classList.remove("show");
    }
  });
};

const explorersUpdate = async () => {
  const elements = document.querySelectorAll(
    ".block-explorers .block-explorer[data-chain-id]"
  );

  if (!elements?.length) {
    return;
  }

  const doUpdate = async (el) => {
    const chainId = el.dataset.chainId;

    if (!chainId) {
      return;
    }

    const promise = await fetch(
      "https://explorer-graph-prod.dexguru.biz/graphql",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query GetLandingChainConfig {
                    chainConfig(chainId: ${chainId} ) {
                      chain
                      chainColor
                      icon
                      shortName
                      name
                    }
                    chainStats(chainId: ${chainId}) {
                      activeAddressesCount
                      lastBlockNumber
                      mediumGasPrice
                      nativeTokenPriceUsd
                      nativeTokenPriceUsd24hDelta
                      smartContractsCount
                      transactionsCount
                      transactionsPerSecond
                      volume24hDeltaUsd
                      volume24hUsd
                    }
                  }`,
        }),
      }
    );

    setTimeout(doUpdate, 5 * 60 * 1000);

    const { data } = await promise.json();

    if (!data) {
      return;
    }

    el.classList.remove("block-explorer--loading");

    el.style.cssText = `--color-chain: ${data.chainConfig.chainColor}`;

    const icon = el.querySelector(".block-explorer__img");
    const title = el.querySelector(".block-explorer__title .name");
    const lastBlock = el.querySelector(
      ".block-explorer-properties__item--last .value"
    );
    const addresses = el.querySelector(
      ".block-explorer-properties__item--addresses .value"
    );
    const contracts = el.querySelector(
      ".block-explorer-properties__item--contracts .value"
    );
    const txs = el.querySelector(".block-explorer-properties__item--txs");
    const txsValue = txs?.querySelector(".value");
    const txsRate = txs?.querySelector(".rate");
    const price = el.querySelector(".block-explorer-properties__item--price");
    const priceValue = price?.querySelector(".value");
    const priceDelta = price?.querySelector(".delta");

    const stats = data?.chainStats;

    if (icon) {
      icon.src = data?.chainConfig?.icon;
    }

    if (title) {
      title.innerHTML = `${data?.chainConfig?.name} ${data?.chainConfig?.chain}`;
    }

    if (lastBlock) {
      lastBlock.innerHTML = stats?.lastBlockNumber.toLocaleString("en-US");
    }

    if (addresses) {
      addresses.innerHTML = parseInt(
        stats?.activeAddressesCount || ""
      ).toLocaleString("en-US");
    }

    if (contracts) {
      contracts.innerHTML = parseInt(
        stats?.smartContractsCount | ""
      ).toLocaleString("en-US");
    }

    if (txsValue) {
      txsValue.innerHTML = stats?.transactionsCount.toLocaleString("en-US");
    }

    if (txsRate) {
      txsRate.innerHTML = stats?.transactionsPerSecond
        ? `${parseFloat(stats?.transactionsPerSecond || 0).toLocaleString(
            "en-US",
            { notation: "compact" }
          )}&nbsp;txs/sec`
        : "";
    }

    if (priceValue) {
      priceValue.innerHTML = parseFloat(
        stats?.nativeTokenPriceUsd || 0
      ).toLocaleString("en-US", {});
    }

    if (priceDelta) {
      const value = parseFloat(stats?.nativeTokenPriceUsd24hDelta || 0);

      priceDelta.innerHTML = value.toLocaleString("en-US", {
        notation: "compact",
        style: "percent",
        signDisplay: "exceptZero",
      });

      priceDelta.classList.remove("delta--positive", "delta--negative");

      priceDelta.classList.add(
        value > 0
          ? "delta--positive"
          : value < 0
          ? "delta--negative"
          : "delta--zero"
      );
    }
  };

  elements.forEach(async (el) => {
    doUpdate(el);
  });
};

const doChainsWidget = () => {
  const dataStr = localStorage.getItem("lastChainsData");
  const data = JSON.parse(dataStr);

  if (!data?.length) {
    return;
  }

  const parent = document.querySelector(".chains-widget__body");

  if (!parent) {
    return;
  }

  const content = data.map((el) => {
    return `<div class="chains-widget-entry"><img class="chains-widget-entry__icon" src="${el.logo_uri}" /> <strong class="chains-widget-entry__title">${el.description}</strong></div>`;
  });

  parent.innerHTML = `<ul class="chains-widget__list"><li class="chains-widget__item">${content.join(
    '</li><li class="chains-widget__item">'
  )}</li></ul>`;
};

const chainsWidget = async () => {
  doChainsWidget();

  const promise = await fetch("https://api.dex.guru/v3/chain/");
  const { data } = await promise.json();

  if (!data) {
    return;
  }

  localStorage.setItem("lastChainsData", JSON.stringify(data));
  doChainsWidget();
};

const bannerGuruCandles = (count = 10) => {
  const parent = document.querySelector(".banner-guru__ripples");

  if (count < 1 || !parent) {
    return;
  }

  const drawCandle = () => {
    const candles = parent.querySelectorAll(".banner-guru__candle");

    if (candles.length >= count) {
      return;
    }

    const candle = document.createElement("div");
    candle.className = `banner-guru__candle banner-guru__candle--${
      Math.random() - 0.5 > 0 ? "positive" : "negative"
    }`;
    candle.style.cssText = `--candle-pos-left: ${
      Math.random() * 100
    }%; --candle-pos-top: ${Math.random() * 50 + 25}%; --candle-size: ${
      Math.random() * 32 + 32
    }px`;

    parent.appendChild(candle);
  };

  window.addEventListener("animationend", (e) => {
    if (e.target.closest(".banner-guru__candle")) {
      e.target.remove();
    }
  });

  setInterval(drawCandle, 500);
};

window.addEventListener("load", () => {
  // observeStickies();
  menuToggler();
  instrumentsFilter();
  explorersUpdate();
  bannerGuruCandles(20);
  chainsWidget();
});
