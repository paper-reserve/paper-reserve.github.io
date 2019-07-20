export const formConsts = {
  SOURCES: [
    "Cash",
    "HDFC",
    "ICICI",
    "ICICI Credit",
    "HDFC Credit",
    "Zeta",
    "Paytm"
  ],
  FAB_SOURCES: [
    { name: "Cash", img: "/assets/rupee.png" },
    { name: "HDFC", img: "/assets/hdfc.png" },
    { name: "ICICI", img: "/assets/icici.png" },
    { name: "Zeta", img: "/assets/zeta.png" },
    { name: "Paytm", img: "/assets/paytm.png" },
    { name: "ICICI Credit", img: "/assets/icici.png" },
    { name: "HDFC Credit", img: "/assets/hdfc.png" }
  ],
  FAB_CATS: [
    { name: "Food" },
    { name: "Shopping" },
    { name: "Travel" },
    { name: "Entertainment" },
    { name: "Payments" },
    { name: "Medical" },
    { name: "Misc." },
    { name: "Transactions" }
  ],
  CATEGORIES: [
    "Food",
    "Shopping",
    "Travel",
    "Entertainment",
    "Payments",
    "Medical",
    "Misc.",
    "Transactions"
  ],
  SUBCATS: {
    Food: ["Tea/Coffee", "Street Food", "Restaurants", "Snacks"],
    Shopping: ["Groceries", "Cosmetics", "Dress", "Accessories", "Household"],
    Travel: [
      "Bus",
      "Auto",
      "Cab",
      "Train",
      "Fuel",
      "Toll",
      "Parking",
      "Air",
      "Service"
    ],
    Entertainment: ["Movie", "Tour"],
    Payments: [
      "Rent",
      "Car Loan",
      "ICICI Due Repay",
      "HDFC Due Repay",
      "Chit",
      "RD",
      "Phone Bill",
      "EB Bill",
      "Cable TV",
      "Maintenance",
      "Gas",
      "iWish"
    ],
    Medical: ["Medicine", "Lab Test", "Consultation"],
    Transactions: [
      "Cash Withdraw",
      "To ICICI",
      "To HDFC",
      "To Paytm",
      "Savings",
      "WHC",
      "To Home"
    ],
    "Misc.": []
  },
  TIMELY_SUGGESTIONS: {
    "6": ["Milk", "Coffee"],
    "7": ["Milk", "Coffee", "Vegtables"],
    "8": ["Milk", "Coffee", "Vegtables"],
    "9": ["Milk", "Coffee", "Vegtables", "ToOffice"],
    "10": ["ToOffice", "Auto", "Coffee", "Peanuts"],
    "11": ["ToOffice", "Auto", "Peanuts", "Coffee"],
    "12": ["Peanuts", "Coffee"],
    "14": ["Peanuts", "Coffee"],
    "15": ["Peanuts", "Coffee", "Snacks"],
    "16": ["Peanuts", "Coffee", "Snacks"],
    "17": ["ToHome", "Peanuts", "Coffee", "Snacks", "Vegtables"],
    "18": ["ToHome", "Peanuts", "Coffee", "Snacks", "Vegtables"],
    "19": ["ToHome", "Peanuts", "Coffee", "Snacks", "Vegtables"],
    "20": ["ToHome", "Peanuts", "Snacks", "Vegtables"],
    "21": ["Auto", "Bus"],
    "22": ["Auto"],
    "23": ["Auto"],
    WE6: ["Milk", "Coffee"],
    WE7: ["Milk", "Coffee", "Vegtables"],
    WE8: ["Milk", "Coffee", "Vegtables"],
    WE9: ["Milk", "Coffee", "Vegtables", "Auto"],
    WE10: ["Snacks", "Coffee", "Auto"],
    WE11: ["Snacks", "Coffee", "Auto", "Vegtables"],
    WE12: ["Snacks", "Coffee", "Auto"],
    WE13: ["Snacks", "Coffee", "Auto"],
    WE14: ["Snacks", "Coffee", "Auto"],
    WE15: ["Snacks", "Coffee", "Auto"],
    WE16: ["Snacks", "Coffee", "Auto"],
    WE17: ["Snacks", "Coffee", "Auto", "Vegtables"],
    WE18: ["Snacks", "Coffee", "Auto", "Vegtables"],
    WE19: ["Snacks", "Auto", "Vegtables"],
    WE20: ["Snacks", "Auto", "Vegtables"],
    WE21: ["Bus", "Auto"],
    WE22: ["Bus", "Auto"]
  },
  SUGGESTIONS: {
    Vegtables: ["Zeta", "Shopping", "Groceries", "🍅", "green", "Vegtables"],
    Auto: ["Cash", "Travel", "Auto", "🚕", "lightgreen", ""],
    Snacks: ["Cash", "Food", "Snacks", "🥠", "red", ""],
    Coffee: ["Cash", "Food", "Tea/Coffee", "☕️", "brown", ""],
    Milk: ["Paytm", "Shopping", "Groceries", "🍶", "grey", "Milk"],
    ToOffice: ["Cash", "Travel", "Bus", "🚍", "green", "🏡-🏢"],
    ToHome: ["Cash", "Travel", "Bus", "🚍", "green", "🏢-🏡"],
    Bus: ["Cash", "Travel", "Bus", "🚍", "green", ""],
    Peanuts: ["Cash", "Food", "Snacks", "🥜", "lightbrown", "🥜"],
    Reset: ["", "", "", "⟲", "grey", null],
    Todo: ["", "", "", "☑", "lightbrown", null]
  }
};
