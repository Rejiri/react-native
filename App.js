import React, { Component } from "react";
import {
  Root,
  Container,
  Header,
  Title,
  Content,
  Button,
  Footer,
  FooterTab,
  Text,
  Body,
  Left,
  Right,
  Icon,
  ListItem,
  Thumbnail,
  Picker,
  Form,
  Label,
  Input,
  Badge,
  H3,
  Item,
  StyleProvider
} from "native-base";
import { View, FlatList, Image, PermissionsAndroid, Alert, ActivityIndicator, ImageBackground, StatusBar, Dimensions, Platform, AsyncStorage } from "react-native";
import { ScrollView, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, TouchableNativeFeedback } from "react-native-gesture-handler";
import { NavigationActions, StackActions, createDrawerNavigator, createStackNavigator, createAppContainer } from "react-navigation";
import MapView, { Marker } from 'react-native-maps';
import SplashScreen from 'react-native-splash-screen';
import { YellowBox } from "react-native"; //todo

import getTheme from "./src/theme/components";
import variables from "./src/theme/variables/commonColor";

import firebase from '@firebase/app';
import firestore from 'firebase/firestore'
require("@firebase/auth");
// require("@firebase/messaging");

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

const jData = require("./data.json").versionAR;

const config = {
  apiKey: "AIzaSyBpPeVjO8M1y5XTBvya4vvVgW2QmX80BA4",
  authDomain: "xuowmfpp82.firebaseapp.com",
  databaseURL: "https://xuowmfpp82.firebaseio.com",
  projectId: "uianse",
  storageBucket: "xuowmfpp82.appspot.com",
  messagingSenderId: "849561643179"
};
firebase.initializeApp(config);

class GItem {
  constructor(id, name, description, price, image) {
    this._id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.image = image;

    this.key = this._id.toString();
  }
}

class Tiae {
  constructor() {
    this.timestamp = new Date();
    this.item = null;
    this.type = -1;
    this.size = -1;
    this.typeOfCutting = -1;
    this.typeOfPreparation = -1;
  }
}

class Misc {
  static getProducts(max) {
    var pCol = new Array();
    for (var i = 0; i < max; i++) {
      pCol.push(new GItem(`${i}`, `Product ${i}`, "", 10 * i, `img${i}`));
    }
    return pCol;
  }
}

class Liandic {
  constructor(jData) {
    this.signIn();
    this.welcomeMessage = jData.welcomeMessage;
    this.placia = new Placia();
    this.placiaCollectionDb = null;
    this.placiaCollection = [];
    this.settings = new Settings(jData);
    this.temps = { minMax: [-1, -1], order: 0, isAdmin: false };
  }

  signIn() {
    firebase.auth().signInAnonymously().then((re) => {
      // global.actions.logToConsole(re);
    }).catch(function (error) {
      // global.actions.logToConsole(error);
    });
  }

  loadTempCollection(type) {
    if (this.placiaCollectionDb == null) {
      const pCol = [];
      var placia = new Placia();
      placia.contactInfo = { fullName: "Jack Nicholson", phoneNumber: "000111222", locationType: 0, coordinate: { latitude: 41.0118116, longitude: 28.9872103 } };
      placia.items.push(new PlaciaItem(global.liandic.settings.items[0]));
      placia.items.push(new PlaciaItem(global.liandic.settings.items[1]));
      placia.items[0].options = {
        type: 0,
        size: 0,
        typeOfCutting: 1,
        typeOfPreparation: 1
      };
      placia.items[1].options = {
        type: 1,
        size: 1,
        typeOfCutting: 0,
        typeOfPreparation: 0
      };
      pCol.push(placia);

      placia = new Placia();
      placia.contactInfo = { fullName: "John Smith", phoneNumber: "000111222", locationType: 1, restaurantIndex: 2 };
      placia.items.push(new PlaciaItem(global.liandic.settings.items[1]));
      placia.items.push(new PlaciaItem(global.liandic.settings.items[2]));
      placia.items.push(new PlaciaItem(global.liandic.settings.items[0]));
      placia.items[0].options = {
        type: 0,
        size: 0,
        typeOfCutting: 1,
        typeOfPreparation: 1
      }
      placia.items[1].options = {
        type: 1,
        size: 1,
        typeOfCutting: 0,
        typeOfPreparation: 0
      }
      placia.items[2].options = {
        type: 0,
        size: 1,
        typeOfCutting: 0,
        typeOfPreparation: 1
      }
      pCol.push(placia);

      this.placiaCollectionDb = pCol;
    }

    this.placiaCollection = this.placiaCollectionDb.filter((item) => { return item.state >= type[0] && item.state <= type[1] });
  }
}

class Settings {
  constructor(jData) {
    this.jData = jData;
    this.items = jData.items.map((item, index) => {
      return new GItem(item.id, item.name, item.description, item.price, item.image);
      //return new GItem(item.id, item.name, item.description, item.price, "https://picsum.photos/500/300/?random" + (index + 10));
    });
  }

  getOptionName(type, index) {
    //global.actions.logToConsole(`getOptionName: ${type} - ${index}`);
    var result = null;
    if (type == 0)
      result = this.jData.productTypes[index];
    else if (type == 1)
      result = this.jData.productSizes[index];
    else if (type == 2)
      result = this.jData.typeOfCutting[index];
    else if (type == 3)
      result = this.jData.typeOfPreparation[index];
    //global.actions.logToConsole(result);
    return result;
  }

  getRestaurantName(index) {
    return this.jData.restaurants[index];
  }

  getCookingType(index) {
    return this.jData.cookingTypes[index];
  }

  getStateName(state) {
    if (state == -2) return this.jData.const.stateA;
    else if (state == 2) return this.jData.const.stateB;
    else if (state == 0) return this.jData.const.stateC;
    else if (state == 1) return this.jData.const.stateD;
    else return "";
  }
}

class Placia {
  constructor() {
    this.id = null;
    this.timestamp = new Date();
    this.state = 0;
    this.items = [];
    this.contactInfo = null;
    this.tempItem = null;
  }

  get firstItem() { return this.items[0]; }

  get restaurantName() { return global.liandic.settings.getRestaurantName(this.contactInfo.restaurantIndex); }
  get cookingType() { return global.liandic.settings.getCookingType(this.contactInfo.cookingType); }

  getInfo() {
    var obj = {};
    obj.timestamp = firebase.firestore.FieldValue.serverTimestamp();
    obj.state = this.state;
    obj.contactInfo = { ...this.contactInfo };
    obj.items = this.items.map(item => {
      return {
        id: item.item._id,
        options: { ...item.options }
      }
    });
    return obj;
  }

  static fromJson(id, jsonDocument) {
    var placia = new Placia();
    placia.id = id;
    placia.contactInfo = jsonDocument.contactInfo;
    placia.items = jsonDocument.items.map(item => {
      var pItem = new PlaciaItem(global.liandic.settings.items[item.id]);
      pItem.options = { ...item.options };
      return pItem;
    });
    placia.state = jsonDocument.state;
    return placia;
  }
}

class PlaciaItem {
  constructor(item) {
    this.item = item;
    this.mode = 0;
    this.options = {
      quantity: 0,
      type: 0,
      size: 0,
      typeOfCutting: 0,
      typeOfPreparation: 0,
      isAlive: false
    };
  }

  get optionType() { return global.liandic.settings.getOptionName(0, this.options.type); }
  get optionSize() { return global.liandic.settings.getOptionName(1, this.options.size); }
  get optionTypeOfCutting() { return global.liandic.settings.getOptionName(2, this.options.typeOfCutting); }
  get optionTypeOfPreparation() { return global.liandic.settings.getOptionName(3, this.options.typeOfPreparation); }

  get totalPrice() { return this.item.price * (this.options.quantity + 1); }

  getClone(withRef, mode) {
    var obj = new PlaciaItem(this.item);
    obj.options = { ...this.options };
    if (withRef)
      obj.root = this;
    if (mode)
      obj.mode = 1;
    return obj;
  }
}

global.liandic = new Liandic(jData);

global.helper = {
  isNull: function (obj, key) {
    return key.split(".").reduce(function (o, x) {
      return (typeof o == "undefined" || o === null) ? o : o[x];
    }, obj);
  }
}

global.actions = {
  logToConsole: (text) => {
    console.warn(text);
  },
  onItemClicked: (context, mode, item) => {
    global.actions.logToConsole(mode);
    if (mode == 0)
      global.liandic.placia.tempItem = new PlaciaItem(item);
    else if (mode == 1) {
      global.liandic.placia.tempItem = item.getClone(true, 1);
    } else
      throw "item: null";
    context.props.navigation.navigate("Details", {});
  },
  navigateToContact: (context) => {
    context.props.navigation.navigate("Info");
  },
  addItemToCart: () => {
    var item = global.liandic.placia.tempItem;
    // item.options = { ...state };
    if (item.mode == 0)
      global.liandic.placia.items.push(item);
    else if (item.mode == 1)
      item.root.options = { ...item.options };
    global.liandic.placia.tempItem = null;
  },
  onCartSubmit: (state) => {
    global.liandic.placia.contactInfo = { ...state };
    //todo
    if (global.liandic.placiaCollectionDb == null)
      global.liandic.loadTempCollection([0, 0]);

    firebase.firestore().collection("orders").doc().set(global.liandic.placia.getInfo());
    global.liandic.placiaCollectionDb.push(global.liandic.placia);
    global.actions.logToConsole(global.liandic.placia.getInfo());
    global.liandic.placia = new Placia();
  },
  onLogin: (context, loginType) => {
    firebase.auth().signInWithEmailAndPassword("admin@example.com", "password").then((re) => {
      global.actions.logToConsole(re);
      global.liandic.temps.isAdmin = false;

      if (!loginType || loginType == "0000")
        global.liandic.temps.minMax = [0, 0];
      else if (loginType == "1111")
        global.liandic.temps.minMax = [1, 1];
      // else if (loginType == "2222")
      //     global.liandic.temps.minMax = [2, 2];
      else if (loginType == "admin") {
        global.liandic.temps.minMax = [0, 1];
        global.liandic.temps.isAdmin = true;
      }
      else
        global.liandic.temps.minMax = [-1, -1];

      context.props.navigation.navigate("Orders");
    }).catch(function (error) {
      global.actions.logToConsole(error);
    });
  },
  onItemClicked2: (context, item) => {
    global.liandic.temps.order = item;
    context.props.navigation.navigate("Order");
  },
  onDone: (context) => {
    if (global.liandic.temps.order.state >= -2 && global.liandic.temps.order.state < 2) {
      if (global.liandic.temps.order.state == -2)
        global.liandic.temps.order.state = 0;
      else
        global.liandic.temps.order.state += 1;
      firebase.firestore().collection("orders").doc(global.liandic.temps.order.id).update({ state: global.liandic.temps.order.state });
    }
    context.props.navigation.goBack();
  },
  onCancel: (context) => {
    global.liandic.temps.order.state = -2;
    firebase.firestore().collection("orders").doc(global.liandic.temps.order.id).update({ state: global.liandic.temps.order.state });
    context.props.navigation.goBack();
  },
  loadPlaciaCollection: (minMax) => {
    //global.actions.logToConsole("loadPlaciaCollection started");
    return new Promise((onDone, onError) => {
      //global.actions.logToConsole("fetching data");
      var pCol = [];
      firebase.firestore().collection("orders").where("state", ">=", minMax[0]).where("state", "<=", minMax[1]).get().then(querySnapshot => {
        //global.actions.logToConsole("querySnapshot: " + querySnapshot.size);
        if (!querySnapshot.empty)
          querySnapshot.forEach(doc => {
            pCol.push(Placia.fromJson(doc.id, doc.data()));
          });
        global.liandic.placiaCollection = pCol;
        onDone("done");
      }).catch((error) => {
        global.liandic.placiaCollection = [];
        //global.actions.logToConsole(error);
      })
    });
  }
}

// this.ref = firebase.firestore().collection('products');
// var newRef = this.ref.doc("akfljgndhj");
// newRef.set({
//     name: "Product C",
//     price: 1500,
//     available: true
// });

//global.liandic.loadTempCollection("0");
//firebase.firestore().collection("orders").doc().set(global.liandic.placiaCollection[1].getInfo());

// this.ref.onSnapshot((querySnapshot) => {
//     const items = [];
//     if (querySnapshot)
//         querySnapshot.forEach((doc) => {
//             const { name, price, available } = doc.data();
//             items.push({
//                 key: doc.id,
//                 //doc, // DocumentSnapshot
//                 name,
//                 price,
//                 available,
//             });
//         });
//     global.actions.logToConsole(items);
// });

const homeStyles = {
  imageContainer: {
    flex: 1,
    width: null,
    height: null
  },
  logoContainer: {
    flex: 1,
    marginTop: deviceHeight / 8,
    marginBottom: 30
  },
  logo: {
    position: "absolute",
    left: Platform.OS === "android" ? 40 : 50,
    top: Platform.OS === "android" ? 35 : 60,
    width: 280,
    height: 100
  },
  text: {
    color: "#D8D8D8",
    bottom: 6,
    marginTop: 5
  }
};

const sidebarStyles = {
  drawerCover: {
    alignSelf: "stretch",
    height: deviceHeight / 4.5,
    width: null,
    position: "relative",
    marginBottom: 10
  },
  drawerImage: {
    position: "absolute",
    left: Platform.OS === "android" ? deviceWidth / 10 : deviceWidth / 9,
    top: Platform.OS === "android" ? deviceHeight / 13 : deviceHeight / 12,
    width: 210,
    height: 75,
    resizeMode: "cover"
  },
  text: {
    fontWeight: Platform.OS === "ios" ? "500" : "400",
    fontSize: 16,
    marginLeft: 20
  },
  badgeText: {
    fontSize: Platform.OS === "ios" ? 13 : 11,
    fontWeight: "400",
    textAlign: "center",
    marginTop: Platform.OS === "android" ? -3 : undefined
  }
};

const primaryStyles = {
  container: {
    backgroundColor: "#FFF"
  },
  text: {
    alignSelf: "center",
    marginBottom: 7
  },
  mb: {
    marginBottom: 15
  }
};

//todo
global.tempTest = {
  products: jData.const.products,
  cart: jData.const.cart,
  aboutUs: jData.const.aboutUs
}

const drawerCover = require("./assets/drawer-cover.png");
const drawerImage = require("./assets/logo-kitchen-sink.png");
const launchscreenBg = require("./assets/launchscreen-bg.png");
const launchscreenLogo = require("./assets/logo-kitchen-sink.png");

const datas = [
  {
    key: "0",
    name: global.tempTest.products,
    route: "Primary",
    icon: "logo-buffer",
    bg: "#DA4437",
    //types: "4"
  },
  {
    key: "1",
    name: global.tempTest.cart,
    route: "Primary",
    icon: "md-cart",
    bg: "#DA4437",
    //types: "4"
  },
  // {
  //   key: "2",
  //   name: global.tempTest.aboutUs,
  //   route: "Primary",
  //   icon: "md-contact",
  //   bg: "#DA4437",
  //   //types: "4"
  // },
  {
    key: "3",
    name: global.tempTest.aboutUs,
    route: "Primary",
    icon: "md-paper",
    bg: "#DA4437",
    //types: "4"
  },
  {
    key: "4",
    name: "Admin",
    route: "Login",
    icon: "ios-cart",
    bg: "#DA4437",
    //types: "4"
  }
];

class Primary extends Component {
  // static navigationOptions = {
  //   header: null,
  // };
  constructor(props) {
    super(props);

    this.state = {
      selectedTab: 0,
      screenTitle: this.getTabTitle(0)
    };

    this.subs = [
      this.props.navigation.addListener('didFocus', (payload) => {
        global.actions.logToConsole("didFocus");
        global.actions.logToConsole(payload);
        if (!isNaN(global.helper.isNull(payload, "state.params.index")))
          this.setState({ selectedTab: Number.parseInt(payload.state.params.index) });
        else
          this.setState({});
      }),
      //this.props.navigation.addListener('willBlur', (payload) => { global.actions.logToConsole("willBlur"); global.actions.logToConsole(payload) })
    ];
  }

  componentWillUnmount() {
    this.subs.forEach(sub => sub.remove());
  }

  getTabTitle(index) {
    if (index == 0) return global.liandic.settings.jData.const.products;
    else if (index == 1) return global.liandic.settings.jData.const.cart;
    else if (index == 3) return global.liandic.settings.jData.const.aboutUs;
    return "dolores";
  }

  toggleTab(index) {
    if (index == 1)
      ;//global.store.welcomeMessage = new Date().toTimeString();
    else if (index == 3)
      ;//this.props.navigation.navigate("Details");
    this.setState({ selectedTab: index, screenTitle: this.getTabTitle(index) });
  }

  onItemClicked(mode, item) {
    //global.actions.onItemClicked(item);
    global.actions.onItemClicked(this, mode, item);
  }

  renderContent() {
    var content = null;
    if (this.state.selectedTab == 0) {
      content = (
        <FlatList data={global.liandic.settings.items} renderItem={({ item, index }) => (
          <TouchableNativeFeedback onPress={(event) => this.onItemClicked(0, item)}>
            <View style={{ height: 200, paddingHorizontal: 15 }}>
              <Image source={{ uri: item.image }} style={{ flex: .8, borderRadius: 25 }} resizeMode="cover" />
              <View style={{ marginLeft: 10, marginRight: 10 }}>
                <Text style={{ color: "silver" }}>{item.name}</Text>
                <Text style={{ color: "gray" }}>{item.description}</Text>
              </View>
            </View>
          </TouchableNativeFeedback>)
        } keyExtractor={(item, index) => index.toString()} />);
    } else if (this.state.selectedTab == 1) {
      const sCart = global.liandic.placia;
      if (sCart.items.length > 0)
        content = (
          <FlatList data={sCart.items} renderItem={({ item, index }) => (
            <ListItem>
              <Left style={{ flex: 2 }}>
                <Thumbnail source={{ uri: item.item.image }} />
              </Left>
              <Body style={{ flex: 5 }}>
                <TouchableNativeFeedback onPress={(event) => { this.onItemClicked(1, item); }}>
                  <Text>{item.item.name}</Text>
                  <Text note>{item.item.description}</Text>
                </TouchableNativeFeedback>
              </Body>
              <Right style={{ flex: 1 }}>
                <Icon name="md-close" onPress={() => {
                  sCart.items.splice(index, 1);
                  this.setState({});
                }} />
              </Right>
            </ListItem>)
          } keyExtractor={(item, index) => index.toString()} />);
    } else if (this.state.selectedTab == 2) {
      content = (
        <View>
          {/* <Text>{"products.length: " + global.liandic.settings.items.length}</Text>
          <Text>{"placia: " + global.liandic.placia.items.length}</Text>
          <Text>{global.liandic.settings.items[0].name}</Text>
          <Text>{global.liandic.welcomeMessage}</Text> */}
        </View>);
    } else if (this.state.selectedTab == 3) {
      content = (
        <Container style={{ alignItems: "center", padding: 10 }}>
          {/* <Thumbnail large source={{ uri: "https://usatftw.files.wordpress.com/2018/08/usp-mlb_-world-series-houston-astros-at-los-angele.jpg?w=1000&h=600&crop=1" }} /> */}
          <Thumbnail large source={require("./assets/courses-icon-10.png")} />
          <Text style={{ fontSize: 32, margin: 10 }}>{global.liandic.settings.jData.const.appName}</Text>
          <Text style={{ textAlign: "center" }}>{global.liandic.settings.jData.const.appDescription}</Text>
          <Button style={{ margin: 30, alignSelf: "center" }} bordered>
            <Icon name="md-cog" />
            <Text>{global.liandic.settings.jData.const.settings}</Text>
          </Button>
          <Text style={{ marginTop: 50, fontWeight: "800", fontSize: 40 }}>{global.liandic.settings.jData.const.shareWithUs}</Text>
          <Text>{global.liandic.settings.jData.const.subscribeText}</Text>
          <Button style={{ margin: 10 }} rounded block>
            <Text>{global.liandic.settings.jData.const.subscribeButton}</Text>
          </Button>
        </Container>);
    }

    return (
      <Content padder>
        {content}
      </Content>
    );
  }

  render() {
    return (
      <Container style={primaryStyles.container}>
        <Header>
          <Left>
            <Button transparent onPress={() => this.props.navigation.openDrawer()}>
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
            <Title>{this.state.screenTitle}</Title>
          </Body>
          {this.state.selectedTab == 1 && global.liandic.placia.items.length > 0 &&
            < Right >
              <Button transparent onPress={() => global.actions.navigateToContact(this)}>
                <Icon name='md-checkmark' />
              </Button>
            </Right>}
        </Header>

        {this.renderContent()}

        <Footer>
          <FooterTab>
            <Button active={this.state.selectedTab == 0} onPress={() => this.toggleTab(0)}>
              <Icon active={this.state.selectedTab == 0} name="logo-buffer" />
              <Text>{this.getTabTitle(0)}</Text>
            </Button>
            <Button badge={global.liandic.placia.items.length > 0} active={this.state.selectedTab == 1} onPress={() => this.toggleTab(1)}>
              {global.liandic.placia.items.length > 0 && <Badge><Text>{global.liandic.placia.items.length}</Text></Badge>}
              <Icon active={this.state.selectedTab == 1} name="md-cart" />
              <Text>{this.getTabTitle(1)}</Text>
            </Button>
            {/* <Button active={this.state.selectedTab == 2} onPress={() => this.toggleTab(2)}>
              <Icon active={this.state.selectedTab == 2} name="md-contact" />
              <Text>{this.getTabTitle(2)}</Text>
            </Button> */}
            <Button active={this.state.selectedTab == 3} onPress={() => this.toggleTab(3)}>
              <Icon active={this.state.selectedTab == 3} name="md-paper" />
              <Text>{this.getTabTitle(3)}</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

class Details extends Component {
  constructor(props) {
    super(props);
    this.placia = global.liandic.placia;
    this.pItem = null;
  }

  onSubmit() {
    global.actions.addItemToCart();
    this.props.navigation.goBack();
  }

  renderAPicker(iconName, title, values, selectedValue, onValueChange) {
    return (
      <ListItem icon>
        <Left>
          <Icon name={iconName} />
          <Text>{`   ${title}    `}</Text>
        </Left>
        <Body>
        </Body>
        <Right>
          <Picker
            note
            mode="dropdown"
            style={{ width: 120 }}
            selectedValue={selectedValue}
            onValueChange={onValueChange}>
            {values.map((item, index) => { return <Picker.Item key={index} label={item} value={index} /> })}
          </Picker>
        </Right>
      </ListItem>);
  }

  render() {
    //this.pItem = this.props.navigation.getParam("pItem");
    const pItem = global.liandic.placia.tempItem;
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            {/* <Title>{this.props.navigation.getParam("testValue")}</Title> */}
            <Title>{global.liandic.settings.jData.filtersScreenTitle}</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          <Image source={{ uri: pItem.item.image }} style={{ height: 165 }} resizeMode="cover" />
          <View style={{ flexDirection: "row", flex: 1, padding: 15 }}>
            <Text style={{ fontSize: 28, fontWeight: "700", flex: 1, textAlign: "center" }}>{pItem.item.name}</Text>
            <Text style={{ fontSize: 28, fontWeight: "700", color: "red" }}>SAR {pItem.totalPrice}</Text>
          </View>
          <View style={{ height: 1, backgroundColor: "silver", marginStart: 30, marginEnd: 30, marginBottom: 10 }}></View>
          <Form>
            <Content>
              {this.renderAPicker("ios-keypad", global.liandic.settings.jData.const.quantity,
                ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
                pItem.options.quantity,
                (value) => { pItem.options.quantity = value; this.setState({}); })}
              {this.renderAPicker("md-funnel", global.liandic.settings.jData.const.productTypes,
                global.liandic.settings.jData.productTypes,
                pItem.options.type,
                (value) => { pItem.options.type = value; pItem.options.isAlive = (value == 1); this.setState({}); })}
              {!pItem.options.isAlive && this.renderAPicker("ios-code-working", global.liandic.settings.jData.const.productSizes,
                global.liandic.settings.jData.productSizes,
                pItem.options.size,
                (value) => { pItem.options.size = value; this.setState({}); })}
              {!pItem.options.isAlive && this.renderAPicker("md-cut", global.liandic.settings.jData.const.typesOfCutting,
                global.liandic.settings.jData.typeOfCutting,
                pItem.options.typeOfCutting,
                (value) => { pItem.options.typeOfCutting = value; this.setState({}); })}
              {!pItem.options.isAlive && this.renderAPicker("md-basket", global.liandic.settings.jData.const.typesOfPreparation,
                global.liandic.settings.jData.typeOfPreparation,
                pItem.options.typeOfPreparation,
                (value) => { pItem.options.typeOfPreparation = value; this.setState({}); })}
              <Button light
                style={{ alignSelf: "flex-end", margin: 10 }}
                onPress={this.onSubmit.bind(this)}>
                <Text>{pItem.mode == 0 ? global.liandic.settings.jData.const.add : global.liandic.settings.jData.const.update}</Text>
                <Icon name="md-cart" />
              </Button>
            </Content>
          </Form>
        </Content>
      </Container>
    );
  }
}

class Info extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullName: "",
      phoneNumber: "",
      locationType: 0,
      restaurantIndex: 0,
      cookingType: 0,
      region: {
        latitude: 41.0818116,
        longitude: 28.8772103,
        latitudeDelta: 0.0050,
        longitudeDelta: 0.0101,
      },
      coordinate: {
        latitude: 41.0818116,
        longitude: 28.8772103,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02
      }
    }
    this.mapRef = null;

    // window.navigator.geolocation.getCurrentPosition((position) => {
    //     this.setState({ position: position });
    // });
    this.requestLocationPermission();
  }

  onRegionChange(region) {
    global.actions.logToConsole(region);
    this.setState({ region: region });
  }

  async requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'Our app needs access to your location',
          buttonNeutral: 'Ask me later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        global.actions.logToConsole('You can use the location');
        navigator.geolocation.getCurrentPosition(
          (position) => {
            global.actions.logToConsole(position);
            this.setState({
              coordinate: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02
              }
            });
            if (this.mapRef)
              this.mapRef.fitToSuppliedMarkers(["marker1"], { animated: true, });
          },
          (error) => global.actions.logToConsole(error.message),
          { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 },
        );
      } else {
        global.actions.logToConsole('Location permission denied');
      }
    } catch (err) {
      global.actions.logToConsole(err);
    }
  }

  onSubmit() {
    Alert.alert(global.liandic.settings.jData.const.confirmationMessageTitle,
      global.liandic.settings.jData.const.confirmationMessageText + "\n" + this.state.phoneNumber,
      [
        {
          text: global.liandic.settings.jData.const.okButton, onPress: () => {
            //global.actions.logToConsole("OK");
            global.actions.onCartSubmit(this.state);
            Alert.alert(global.liandic.settings.jData.const.finalMessageTitle,
              global.liandic.settings.jData.const.finalMessageText,
              [{
                text: global.liandic.settings.jData.const.okButton, onPress: () => {
                  this.props.navigation.dispatch(StackActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({
                        routeName: 'Drawer',
                        params: { index: "0" },
                      }),
                    ],
                  }));
                }
              }]);
          }
        },
        {
          text: global.liandic.settings.jData.const.cancelButton, onPress: () => {
            //global.actions.logToConsole("Cancel");
          }
        }
      ]);
  }

  onLocationTypeChanged(value) {
    global.actions.logToConsole("locationType: " + value);
    this.setState({ locationType: value });
    if (value == 0) {
      this.requestLocationPermission();
    }
  }

  render() {
    this.pItem = this.props.navigation.getParam("pItem");
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>{global.liandic.settings.jData.contactScreenTitle}</Title>
          </Body>
          <Right />
        </Header>
        <Content style={{ flex: 0.5, margin: 16, padding: 5, borderWidth: 1, borderRadius: 10, borderColor: "#e8e8e8" }}>
          <Form>
            <Item>
              <Icon active name='ios-person' />
              <Input placeholder={global.liandic.settings.jData.const.fullName} onChangeText={(text) => this.setState({ fullName: text })} />
            </Item>
            <Item>
              <Icon active name='md-call' />
              <Input placeholder={global.liandic.settings.jData.const.phoneNumber} onChangeText={(text) => this.setState({ phoneNumber: text })} />
            </Item>
            <ListItem icon style={{ marginTop: 10 }}>
              <Left>
                <Icon name="md-pin" />
                <Text style={{}}>{`   ${global.liandic.settings.jData.const.location}   `}</Text>
              </Left>
              <Body>
              </Body>
              <Right>
                <Picker
                  note
                  mode="dropdown"
                  style={{ width: 120 }}
                  selectedValue={this.state.locationType}
                  onValueChange={this.onLocationTypeChanged.bind(this)}>
                  <Picker.Item key={0} label={global.liandic.settings.jData.const.currentLocation} value={0} />
                  <Picker.Item key={1} label={global.liandic.settings.jData.const.chooseOnMap} value={1} />
                  <Picker.Item key={2} label={global.liandic.settings.jData.const.sendToRestaurant} value={2} />
                </Picker>
              </Right>
            </ListItem>
            {(this.state.locationType == 0 || this.state.locationType == 1) && <View style={{ borderRadius: 20, overflow: "hidden", marginVertical: 10 }}>
              <MapView style={{ height: 200, width: "100%" }}
                ref={(ref) => this.mapRef = ref}
                initialRegion={this.state.region}
              //onRegionChange={this.onRegionChange.bind(this)}
              >
                {true &&
                  <Marker identifier="marker1" coordinate={this.state.coordinate} draggable={this.state.locationType == 1 ? true : false}
                    onDragEnd={(e) => {
                      global.actions.logToConsole(e.nativeEvent.coordinate);
                      this.setState({ coordinate: e.nativeEvent.coordinate });
                    }} />}
                {/* {true &&
                                            <Marker identifier="marker2" draggable
                                                coordinate={this.state.coordinate2}
                                                onDragEnd={(e) => {
                                                    global.actions.logToConsole(e.nativeEvent.coordinate);
                                                    this.setState({ coordinate2: e.nativeEvent.coordinate });
                                                }}>
                                                <Icon name="ios-pin" style={{ color: "green" }} />
                                            </Marker>} */}
              </MapView>
            </View>}
            {this.state.locationType == 2 &&
              <View>
                <ListItem icon style={{ marginTop: 10 }}>
                  <Left>
                    <Icon name="md-restaurant" />
                    <Text style={{}}>{`   ${global.liandic.settings.jData.const.restaurants}   `}</Text>
                  </Left>
                  <Body>
                  </Body>
                  <Right>
                    <Picker
                      note
                      mode="dropdown"
                      style={{ width: 120 }}
                      selectedValue={this.state.restaurantIndex}
                      onValueChange={(value) => this.setState({ restaurantIndex: value })}>
                      {global.liandic.settings.jData.restaurants.map((item, index) => {
                        return <Picker.Item key={index} label={item} value={index} />
                      })}
                    </Picker>
                  </Right>
                </ListItem>
                <ListItem icon style={{ marginTop: 10 }}>
                  <Left>
                    <Icon name="md-ice-cream" />
                    <Text style={{}}>{`   ${global.liandic.settings.jData.const.cookingType}   `}</Text>
                  </Left>
                  <Body>
                  </Body>
                  <Right>
                    <Picker
                      note
                      mode="dropdown"
                      style={{ width: 120 }}
                      selectedValue={this.state.cookingType}
                      onValueChange={(value) => this.setState({ cookingType: value })}>
                      {global.liandic.settings.jData.cookingTypes.map((item, index) => {
                        return <Picker.Item key={index} label={item} value={index} />
                      })}
                    </Picker>
                  </Right>
                </ListItem>
              </View>}
            <Button rounded
              style={{ alignSelf: "flex-end", margin: 5, marginTop: 15 }}
              onPress={this.onSubmit.bind(this)}>
              <Text>{global.liandic.settings.jData.const.submit}</Text>
              <Icon name="md-cart" />
            </Button>
          </Form>
        </Content>
      </Container>
    );
  }
}

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: ""
    }
    this.onLogin = this.onLogin.bind(this);
  }

  onLogin() {
    global.actions.onLogin(this, this.state.password);
  }

  render() {
    return (
      <Container>
        <Header>
          <Body />
          <Right />
        </Header>
        <Content>
          <Container style={{ alignItems: "center" }}>
            <Thumbnail large source={require("./assets/courses-icon-10.png")} />
            <Text style={{ textAlign: "center", padding: 5 }}>Expedita ipsum libero repellendus error qui velit error sint debitis. Voluptas esse ea aut facilis. Rerum harum dolorem et placeat id nobis assumenda aut.</Text>
            <Text style={{ fontSize: 32, margin: 10 }}>Log in</Text>
            <Form style={{ width: "75%" }}>
              <Item>
                <Icon active name='md-lock' />
                <Input placeholder='password' onChangeText={(text) => this.setState({ password: text })} />
              </Item>
              <Button rounded
                style={{ alignSelf: "center", margin: 5, marginTop: 15 }}
                onPress={this.onLogin}>
                <Text>Log in</Text>
                <Icon name="md-cart" />
              </Button>
            </Form>
          </Container>
        </Content>
      </Container>
    );
  }
}

class Orders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: true,
      selectedValue: 0
    }
    this.onItemClicked = this.onItemClicked.bind(this);
    //.then(this.setState({ refreshing: false }));
    this.subs = [
      this.props.navigation.addListener('didFocus', (payload) => {
        global.actions.logToConsole("didFocus");
        global.actions.logToConsole(payload);
        this.refreshList(global.liandic.temps.minMax);
      })];
  }

  refreshList(minMax) {
    global.liandic.temps.minMax = minMax;
    this.setState({ refreshing: true });
    global.actions.loadPlaciaCollection(minMax).then((result) => {
      //global.actions.logToConsole(result);
      this.setState({ refreshing: false });
    });
  }

  componentWillUnmount() {
    this.subs.forEach(sub => sub.remove());
  }

  onItemClicked(item) {
    global.actions.onItemClicked2(this, item);
  }

  render() {
    const pCol = global.liandic.placiaCollection;

    return (
      <Container>
        <Content>
          <Text style={{ fontSize: 28, fontWeight: "800", textAlign: "center", margin: 15 }}>{global.liandic.settings.jData.const.orders}</Text>
          {global.liandic.temps.isAdmin &&
            <ListItem icon style={{ margin: 10 }}>
              <Left>
                <Icon name="md-funnel" />
                <Text style={{}}>{`   ${global.liandic.settings.jData.const.typeOfOrder}   `}</Text>
              </Left>
              <Body>
              </Body>
              <Right>
                <Picker
                  note
                  mode="dropdown"
                  style={{ width: 120 }}
                  selectedValue={this.state.selectedValue}
                  onValueChange={(value) => { this.setState({ selectedValue: value }); this.refreshList(value == 0 ? [0, 1] : (value == 1 ? [2, 2] : [-2, -2])); }}>
                  <Picker.Item key={0} label={global.liandic.settings.jData.const.inProgress} value={0} />
                  <Picker.Item key={1} label={global.liandic.settings.jData.const.haveBeenDone} value={1} />
                  <Picker.Item key={2} label={global.liandic.settings.jData.const.cancelled} value={2} />
                </Picker>
              </Right>
            </ListItem>
          }
          {this.state.refreshing && <ActivityIndicator size="large" color="#0000ff" />}
          {!this.state.refreshing &&
            <FlatList data={pCol} keyExtractor={(item, index) => index.toString()}
              onRefresh={() => { this.setState({}); }}
              refreshing={this.state.refreshing}
              renderItem={({ item }) => (
                <TouchableNativeFeedback onPress={(event) => this.onItemClicked(item)}>
                  <ListItem avatar>
                    <Left>
                      {/* <Thumbnail source={{ uri: item.items[0].item.image }} /> */}
                      <Icon active name="ios-cart" />
                    </Left>
                    <Body>
                      <View style={{}}>
                        <Text>{item.contactInfo.fullName}
                          <Text>           </Text>
                          {global.liandic.temps.isAdmin && <Text style={{ color: (item.state == 0 ? "blue" : "red") }}>{global.liandic.settings.getStateName(item.state)}</Text>}
                        </Text>
                        <Text note>{item.contactInfo.phoneNumber}</Text>
                      </View>
                    </Body>
                    <Right>
                      <Text note>{item.items.length}</Text>
                    </Right>
                  </ListItem>
                </TouchableNativeFeedback>
              )} />}
        </Content>
      </Container>
    );
  }
}

class Order extends Component {
  constructor(props) {
    super(props);
    this.onDone = this.onDone.bind(this);
    this.onCancel = this.onCancel.bind(this);

    this.subs = [
      this.props.navigation.addListener('didFocus', (payload) => { global.actions.logToConsole("didFocus"); global.actions.logToConsole(payload); this.setState({}); })];
  }

  componentWillUnmount() {
    this.subs.forEach(sub => sub.remove());
  }

  onDone() {
    global.actions.onDone(this);
  }

  onCancel() {
    global.actions.onCancel(this);
  }

  render() {
    const item = global.liandic.temps.order;

    return (
      <Container>
        <Header>
          <Left>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>{global.liandic.settings.jData.const.order}</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          <Text style={{ fontSize: 28, fontWeight: "800", alignSelf: "center" }}>{global.liandic.settings.jData.const.contents}</Text>
          <FlatList data={item.items} renderItem={({ item, index }) => (
            <ListItem avatar>
              <Left>
                <Thumbnail source={{ uri: item.item.image }} />
              </Left>
              <Body>
                <Text>{item.item.name} ({item.options.quantity + 1})</Text>
                <Text note>{item.optionType}</Text>
                {item.options.type == 0 &&
                  <View>
                    <Text note>{item.optionSize}</Text>
                    <Text note>{item.optionTypeOfCutting}</Text>
                    <Text note>{item.optionTypeOfPreparation}</Text>
                  </View>
                }
              </Body>
              <Right>
                <Text note></Text>
              </Right>
            </ListItem>)
          } keyExtractor={(item, index) => index.toString()} />
          <View style={{ marginTop: 10, alignItems: "center" }}>
            <Text style={{ fontSize: 28, fontWeight: "800" }}>{global.liandic.settings.jData.const.contactInfo}</Text>
            <Text>Name: {item.contactInfo.fullName}</Text>
            <Text>Phone: {item.contactInfo.phoneNumber}</Text>
            {item.contactInfo.locationType == 2 &&
              <View>
                <Text>Restaurant: {item.restaurantName}</Text>
                <Text>Cooking Type: {item.cookingType}</Text>
              </View>}
            <View style={{ flexDirection: "row" }}>
              {global.liandic.temps.isAdmin &&
                <Button rounded danger
                  style={{ alignSelf: "center", margin: 5, marginTop: 15 }}
                  onPress={this.onCancel}>
                  <Text>{global.liandic.settings.jData.const.cancelButton}</Text>
                  <Icon name="md-close" />
                </Button>}
              <Button rounded
                style={{ alignSelf: "center", margin: 5, marginTop: 15 }}
                onPress={this.onDone}>
                <Text>{global.liandic.settings.jData.const.doneButton}</Text>
                <Icon name="md-checkmark" />
              </Button>
            </View>
          </View>
          {(item.contactInfo.locationType == 0 || item.contactInfo.locationType == 1) && <View style={{ borderRadius: 20, overflow: "hidden", margin: 10 }}>
            <MapView style={{ height: 200, width: "100%" }}
              //ref={(ref) => this.mapRef = ref}
              initialRegion={{ ...item.contactInfo.coordinate, latitudeDelta: 0.006, longitudeDelta: 0.006 }}
            //onRegionChange={this.onRegionChange.bind(this)}
            >
              {true && <Marker identifier="marker1" coordinate={item.contactInfo.coordinate} />}
            </MapView>
          </View>}
        </Content>
      </Container >
    );
  }
}

class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shadowOffsetWidth: 1,
      shadowRadius: 4
    };
  }

  render() {
    return (
      <Container>
        <Content
          bounces={false}
          style={{ flex: 1, backgroundColor: "#fff", top: -1 }}
        >
          <View>
            <Image source={{ uri: global.liandic.settings.jData.drawerImage }} style={sidebarStyles.drawerCover} />
            <Image square style={sidebarStyles.drawerImage} source={{}} />
          </View>
          <Container style={{ flexDirection: "row", height: 40, margin: 10 }}>
            <Image source={require("./assets/courses-icon-10.png")} style={{ width: 35, height: 35 }} resizeMode={"contain"} />
            <Text style={{ margin: 10, fontWeight: "900" }}>{global.liandic.settings.jData.const.appName}</Text>
          </Container>
          <Text style={{ marginHorizontal: 10, paddingBottom: 5, borderBottomColor: "silver", borderBottomWidth: 1 }}>{global.liandic.settings.jData.const.appDescription}</Text>

          <FlatList
            data={datas}
            keyExtractor={(item, index) => item.key}
            renderItem={({ item }) => (
              <ListItem
                button
                noBorder
                onPress={() => {
                  if (item.key == "4")
                    this.props.navigation.navigate(item.route, { tab: Number.parseInt(item.key) });
                  else
                    this.props.navigation.dispatch(StackActions.reset({
                      index: 0,
                      actions: [
                        NavigationActions.navigate({
                          routeName: 'Drawer',
                          params: { index: item.key },
                        }),
                      ],
                    }));
                }}
              >
                <Left>
                  <Icon
                    active
                    name={item.icon}
                    style={{ color: "#777", fontSize: 26, width: 30 }}
                  />
                  <Text style={sidebarStyles.text}>
                    {item.name}
                  </Text>
                </Left>
                {item.types &&
                  <Right style={{ flex: 1 }}>
                    <Badge
                      style={{
                        borderRadius: 3,
                        height: 25,
                        width: 72,
                        backgroundColor: item.bg
                      }}
                    >
                      <Text
                        style={sidebarStyles.badgeText}
                      >{`${item.types} Types`}</Text>
                    </Badge>
                  </Right>}
              </ListItem>)
            }
          />
        </Content>
      </Container >
    );
  }
}

class Home extends Component {
  render() {
    return (
      <Container>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={launchscreenBg} style={homeStyles.imageContainer}>
          <View style={homeStyles.logoContainer}>
            <ImageBackground source={launchscreenLogo} style={homeStyles.logo} />
          </View>
          <View
            style={{
              alignItems: "center",
              marginBottom: 50,
              backgroundColor: "transparent"
            }}
          >
            <H3 style={homeStyles.text}>{this.props.first}</H3>
            <View style={{ marginTop: 8 }} />
            <H3 style={homeStyles.text}>NativeBase components</H3>
            <View style={{ marginTop: 8 }} />
          </View>
          <View style={{ marginBottom: 80 }}>
            <Button
              style={{ backgroundColor: "#6FAF98", alignSelf: "center" }}
              onPress={() => this.props.navigation.openDrawer()}
            >
              <Text>Lets Go!</Text>
            </Button>
          </View>
        </ImageBackground>
      </Container>
    );
  }
}

class Maps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullName: "",
      phoneNumber: "",
      address: "",
      locationType: "",
      position: "",
      coordinate: {
        latitude: 40.0818116,
        longitude: 20.8772103
      },
      coordinate2: {
        latitude: 41.0918116,
        longitude: 28.0072103
      }
    }
    this.requestLocationPermission();
  }

  async requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'Our app needs access to your location ' +
            'so we can know your current position.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        global.actions.logToConsole('You can use the location');
        navigator.geolocation.getCurrentPosition(
          (position) => {
            global.actions.logToConsole("wokeeey");
            global.actions.logToConsole(position);
            this.setState({
              coordinate: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            });
          },
          (error) => this.setState({ error: error.message }),
          { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 },
        );
      } else {
        global.actions.logToConsole('Location permission denied');
      }
    } catch (err) {
      global.actions.logToConsole(err);
    }
  }

  render() {
    return (
      <View>
        <MapView style={{ height: "100%", width: "100%", marginVertical: 15 }}
          initialRegion={{
            latitude: this.state.coordinate.latitude,
            longitude: this.state.coordinate.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          <Marker coordinate={this.state.coordinate} />
          <Marker draggable
            coordinate={this.state.coordinate2}
            onDragEnd={(e) => { global.actions.logToConsole(e.nativeEvent.coordinate); this.setState({ coordinate2: e.nativeEvent.coordinate }); }}
          />
        </MapView>

      </View >);
  }
}

const Drawer = createDrawerNavigator(
  {
    Home: { screen: Home },
    Primary: { screen: Primary },
    Details: { screen: Details },
    Info: { screen: Info },
    Maps: { screen: Maps },
    Login: { screen: Login },
    Orders: { screen: Orders },
    Order: { screen: Order }
  },
  {
    initialRouteName: "Primary",
    contentOptions: {
      activeTintColor: "#e91e63"
    },
    contentComponent: props => <SideBar {...props} />
  }
);

const AppNavigator = createStackNavigator(
  {
    Drawer: { screen: Drawer }
  },
  {
    initialRouteName: "Drawer",
    headerMode: "none"
  }
);

const AppNavigator2 = createStackNavigator(
  {
    Login: { screen: Login },
    Orders: { screen: Orders },
    Order: { screen: Order }
  },
  {
    initialRouteName: "Login",
    headerMode: "none"
  }
);

const AppContainer = createAppContainer(AppNavigator);

const App = () =>
  <Root>
    <AppContainer />
  </Root>;

export default class Setup extends Component {
  constructor(props) {
    super(props);
    //console.disableYellowBox = true;
    //YellowBox.ignoreWarnings(['Setting a timer']);
    //require('ErrorUtils').setGlobalHandler((error, isFatal) => {
    //});
  }

  componentDidMount() {
    SplashScreen.hide();
  }

  render() {
    return (
      <StyleProvider style={getTheme(variables)}>
        <App />
      </StyleProvider>
    );
  }
}