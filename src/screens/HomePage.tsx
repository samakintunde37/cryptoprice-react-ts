import React, { useContext, useEffect } from "react";

import { Tabs, Icon } from "antd";

import Container from "../components/Container/Container";
import CurrencyCard from "../components/CurrencyCard/CurrencyCard";

import { HomeContext } from "../context/HomeContext";
import { FavoritesContext } from "../context/FavoritesContext";

import { TOP_CURRENCIES_API } from "../services/api";
import { formatTime } from "../util/_time";

const { TabPane } = Tabs;

const HomePage = () => {
  const { results, dispatchResults } = useContext(HomeContext);
  const { dispatchFavorites } = useContext(FavoritesContext);

  const { currencyResults } = results;

  const handleFavorite = (currencyResult: object) => {
    dispatchFavorites({ payload: currencyResult });
  };

  const fetchTopCurrencies = async () => {
    const res = await fetch(
      `${TOP_CURRENCIES_API}/totalvolfull?limit=20&tsym=NGN&api_key=${
        process.env.REACT_APP_CRYPTOCOMPARE_API_KEY
      }`
    );
    const data = await res.json();
    const results = data.Data;

    const topCurrencies = results.map((result: any) => {
      const infoResult = result.CoinInfo;
      const displayResult = result.DISPLAY.NGN;
      const rawResult = result.RAW.NGN;
      
      return {
        id: infoResult.Id,
        isFavorite: false,
        image: `https://cryptocompare.com${displayResult.IMAGEURL}`,
        last_updated: formatTime(rawResult.LASTUPDATE),
        name: infoResult.FullName,
        price: displayResult.PRICE,
        percentage_change: displayResult.CHANGEPCT24HOUR,
        symbol: infoResult.Name
      };
    });

    dispatchResults({
      type: "FETCH_TOP_CURRENCIES",
      results: topCurrencies
    });
  };

  useEffect(() => {
    fetchTopCurrencies();
  }, []);

  const renderTabPane = (index: number) => {
    switch (index) {
      case 0:
        return currencyResults.map(
          (currencyResult: any, i: string | number | undefined) => (
            <CurrencyCard
              key={i}
              currencyResult={currencyResult}
              handleFavorite={handleFavorite}
            />
          )
        );

      case 1:
        const topGainers = currencyResults.filter(
          (
            result: {
              percentage_change: {
                slice: (arg0: number, arg1: number) => string;
              };
            },
            i: any
          ) => result.percentage_change.slice(0, 1) !== "-"
        );
        return topGainers.map(
          (currencyResult: any, i: string | number | undefined) => (
            <CurrencyCard
              key={i}
              currencyResult={currencyResult}
              handleFavorite={handleFavorite}
            />
          )
        );

      case 2:
        const topLosers = currencyResults.filter(
          (
            result: {
              percentage_change: {
                slice: (arg0: number, arg1: number) => string;
              };
            },
            i: any
          ) => result.percentage_change.slice(0, 1) === "-"
        );
        return topLosers.map(
          (currencyResult: any, i: string | number | undefined) => (
            <CurrencyCard
              key={i}
              currencyResult={currencyResult}
              handleFavorite={handleFavorite}
            />
          )
        );

      default:
        return <h3>Nothing to see here</h3>;
    }
  };

  const homeTabs =  [
      <span>
        <Icon type='global'/>Global
      </span>,
      <span>
        <Icon type='rise'/>Top Gainers
      </span>,
      <span>
        <Icon type='fall'/>Top Losers
      </span>
    ];
  

  return (
    <div>
      <Tabs
        defaultActiveKey="0"
        tabPosition="top"
        tabBarStyle={{ display: "flex", width: "100%" }}
      >
        {homeTabs.map<JSX.Element>((tab: JSX.Element, index: number) => (
          <TabPane tab={tab} key={`${index}`}>
            <Container padding="0 0.75rem 0.75rem 0.75rem">{renderTabPane(index)}</Container>
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default HomePage;
