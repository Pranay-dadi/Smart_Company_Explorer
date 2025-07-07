import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const InfiniteScrollWrapper = ({ fetchData, data, renderItem, type }) => {
  const [items, setItems] = useState(data);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setItems(data);
  }, [data]);

  const loadMore = async () => {
    try {
      const response = await fetchData(page + 1);
      if (response.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => [...prev, ...response]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      setHasMore(false);
    }
  };

  return (
    <InfiniteScroll
      dataLength={items.length}
      next={loadMore}
      hasMore={hasMore}
      loader={
        <div className="text-center py-4">
          <div className="w-8 h-8 border-4 border-primary light:border-primary-light dark:border-primary-dark border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-text light:text-text-light dark:text-text-dark mt-2">Loading more...</p>
        </div>
      }
      endMessage={<p className="text-center py-4 text-text light:text-text-light dark:text-text-dark">No more {type} to load.</p>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, index) => renderItem(item, index))}
      </div>
    </InfiniteScroll>
  );
};

export default InfiniteScrollWrapper;