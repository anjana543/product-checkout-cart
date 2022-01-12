import styles from "./Checkout.module.css";
import { LoadingIcon } from "./Icons";
import { getProducts } from "./dataService";
import { useEffect, useState } from "react";

// You are provided with an incomplete <Checkout /> component.
// You are not allowed to add any additional HTML elements.
// You are not allowed to use refs.

// Once the <Checkout /> component is mounted, load the products using the getProducts function.
// Once all the data is successfully loaded, hide the loading icon.
// Render each product object as a <Product/> component, passing in the necessary props.
// Implement the following functionality:
//  - The add and remove buttons should adjust the ordered quantity of each product
//  - The add and remove buttons should be enabled/disabled to ensure that the ordered quantity can’t be negative and can’t exceed the available count for that product.
//  - The total shown for each product should be calculated based on the ordered quantity and the price
//  - The total in the order summary should be calculated
//  - For orders over $1000, apply a 10% discount to the order. Display the discount text only if a discount has been applied.
//  - The total should reflect any discount that has been applied
//  - All dollar amounts should be displayed to 2 decimal places
const DISCOUNT_PRICE = 10;
const MAX_ORDER_PRICE = 1000;

const calculatePriceBasedOnQty = (item) =>
  item?.qty ? item?.qty * item.price : 0;

const calculateDiscount = (value) =>
  value > MAX_ORDER_PRICE ? value - (value * DISCOUNT_PRICE) / 100 : 0;

const Product = (props) => {
  const { item, onAdd, onRemove, cardItems } = props;

  const selectedItem = cardItems.find((x) => x.id === item.id);

  const totalPrice = () => {
    const total = calculatePriceBasedOnQty(selectedItem);
    const discountPrice = calculateDiscount(total);
    return discountPrice === 0 ? total : discountPrice;
  };

  return (
    <tr>
      <td>{item.id}</td>
      <td>{item.name}</td>
      <td>{item.availableCount}</td>
      <td>${item.price}</td>
      <td>{selectedItem?.qty || 0}</td>
      <td>${totalPrice().toFixed(2)}</td>
      <td>
        <button
          onClick={() => onAdd(item)}
          className={styles.actionButton}
          disabled={selectedItem?.qty >= item.availableCount}
        >
          +
        </button>
        <button
          onClick={() => onRemove(item)}
          className={styles.actionButton}
          disabled={!selectedItem?.qty || selectedItem?.qty === 0}
        >
          -
        </button>
      </td>
    </tr>
  );
};

const Checkout = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cardItems, setCardItems] = useState([]);
  useEffect(() => {
    setLoading(true);
    getProducts().then((response) => {
      setLoading(false);
      setProducts(response);
    });
  }, []);

  const onAdd = (product) => {
    const isExist = cardItems.find((item) => item.id === product.id);
    if (isExist) {
      setCardItems(
        cardItems.map((item) => {
          return item.id === product.id
            ? { ...isExist, qty: isExist.qty + 1 }
            : item;
        })
      );
    } else {
      setCardItems([...cardItems, { ...product, qty: 1 }]);
    }
  };

  const onRemove = (product) => {
    const isExist = cardItems.find((item) => item.id === product.id);
    if (isExist?.qty === 1) {
      setCardItems(cardItems.filter((item) => item.id !== product.id));
    } else {
      setCardItems(
        cardItems.map((item) => {
          return item.id === product.id
            ? { ...isExist, qty: isExist.qty - 1 }
            : item;
        })
      );
    }
  };

  const totalPrice = cardItems.reduce((sum, i) => sum + i.qty * i.price, 0);

  const discountPrice = cardItems.reduce((sum, i) => {
    const total = calculatePriceBasedOnQty(i);
    const discountPrice = calculateDiscount(total);
    return sum + discountPrice > 0 ? total - discountPrice : 0;
  }, 0);

  return (
    <div>
      <header className={styles.header}>
        <h1>Electro World</h1>
      </header>
      <main>
        {loading ? (
          <LoadingIcon />
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th># Available</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => {
                  return (
                    <Product
                      item={item}
                      key={item.id}
                      cardItems={cardItems}
                      onAdd={onAdd}
                      onRemove={onRemove}
                    />
                  );
                })}
              </tbody>
            </table>
            <h2>Order summary</h2>
            <p>Discount: $ {discountPrice.toFixed(2)}</p>
            <p>Total: ${totalPrice.toFixed(2)} </p>
          </>
        )}
      </main>
    </div>
  );
};

export default Checkout;
