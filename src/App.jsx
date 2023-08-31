import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map((product) => {
  const category = categoriesFromServer
    .find(currentCategory => currentCategory.id === product.categoryId);
  const user = usersFromServer
    .find(currentUser => currentUser.id === category.ownerId);

  return {
    ...product,
    category,
    user,
  };
});

function getVisibleProducts(
  currentProducts,
  selectedUserName,
  query,
  selectedCategory,
  sortBy,
  sortByReverse,
) {
  let visibleProducts = [...currentProducts];

  if (selectedUserName) {
    visibleProducts = visibleProducts
      .filter(product => product.user.name === selectedUserName);
  }

  if (query) {
    visibleProducts = visibleProducts
      .filter(product => product.name.toLowerCase()
        .includes(query.trim().toLowerCase()));
  }

  if (selectedCategory.length) {
    visibleProducts = visibleProducts
      .filter(product => selectedCategory.includes(product.category.title));
  }

  if (sortBy) {
    switch (sortBy) {
      case 'ID':
        visibleProducts.sort((a, b) => a.id - b.id);
        break;
      case 'Product':
        visibleProducts
          .sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Category':
        visibleProducts
          .sort((a, b) => (
            a.category.title.localeCompare(b.category.title)));
        break;
      case 'User':
        visibleProducts
          .sort((a, b) => a.user.name.localeCompare(b.user.name));
        break;
      default:
        break;
    }
  }

  if (sortByReverse) {
    visibleProducts.reverse();
  }

  return visibleProducts;
}

export const App = () => {
  const [selectedUserName, setSelectedUserName] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [sortByReverse, setSortByReverse] = useState(false);

  const visibleProducts = getVisibleProducts(
    products,
    selectedUserName,
    query,
    selectedCategory,
    sortBy,
    sortByReverse,
  );

  function handleResetAll() {
    setQuery('');
    setSelectedUserName('');
    setSelectedCategory([]);
    setSortBy('');
    setSortByReverse(false);
  }

  function handleCategory(categoryTitle) {
    return () => {
      if (selectedCategory.includes(categoryTitle)) {
        setSelectedCategory(prevValue => prevValue
          .filter(val => val !== categoryTitle));
      } else {
        setSelectedCategory(prevValue => [
          ...prevValue,
          categoryTitle,
        ]);
      }
    };
  }

  function setSortByPeram(param) {
    if (sortByReverse) {
      setSortByReverse(!sortByReverse);
      setSortBy('');

      return;
    }

    if (sortBy === param) {
      setSortByReverse(!sortByReverse);
    }

    setSortBy(param);
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({ 'is-active': !selectedUserName })}
                onClick={() => setSelectedUserName('')}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  className={
                    cn({ 'is-active': user.name === selectedUserName })
                  }
                  onClick={() => setSelectedUserName(user.name)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={
                    event => setQuery(event.target.value)
                  }
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {!!query && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}

              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategory.length,
                })}
                onClick={() => setSelectedCategory([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategory.includes(category.title),
                  })}
                  href="#/"
                  onClick={handleCategory(category.title)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={handleResetAll}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {visibleProducts.length ? (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      ID

                      <a
                        href="#/"
                        onClick={() => setSortByPeram('ID')}
                      >
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={cn('fas', {
                              'fa-sort': sortBy !== 'ID',
                              'fa-sort-down': sortBy === 'ID' && sortByReverse,
                              'fa-sort-up': sortBy === 'ID' && !sortByReverse,
                            })}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Product

                      <a
                        href="#/"
                        onClick={() => setSortByPeram('Product')}
                      >
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={cn('fas', {
                              'fa-sort': sortBy !== 'Product',
                              'fa-sort-down':
                              sortBy === 'Product' && sortByReverse,
                              'fa-sort-up':
                              sortBy === 'Product' && !sortByReverse,
                            })}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Category

                      <a
                        href="#/"
                        onClick={() => setSortByPeram('Category')}
                      >
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={cn('fas', {
                              'fa-sort': sortBy !== 'Category',
                              'fa-sort-down':
                              sortBy === 'Category' && sortByReverse,
                              'fa-sort-up':
                              sortBy === 'Category' && !sortByReverse,
                            })}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      User

                      <a
                        href="#/"
                        onClick={() => setSortByPeram('User')}
                      >
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={cn('fas', {
                              'fa-sort': sortBy !== 'User',
                              'fa-sort-down':
                              sortBy === 'User' && sortByReverse,
                              'fa-sort-up':
                              sortBy === 'User' && !sortByReverse,
                            })}
                          />
                        </span>
                      </a>
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map(product => (
                  <tr key={product.id} data-cy="Product">
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>

                    <td data-cy="ProductCategory">{`${product.category.icon} - ${product.category.title}`}</td>

                    <td
                      data-cy="ProductUser"
                      className={
                        cn('has-text-link',
                          {
                            'has-text-link': product.user.sex === 'm',
                            'has-text-danger': product.user.sex === 'f',
                          })
                      }
                    >
                      {product.user.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
