import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import db from '../config';
import { ListItem, Icon } from 'react-native-elements';

export default class SearchScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allTransactions: [],
      searchText: '',
      lastTransaction: null
    };
  }

  getTransactions = () => {
    db.collection('transactions')
    .limit(10)
      .get()
      .then((data) => {
        data.docs.map((i) => {
          this.setState({
            allTransactions: [...this.state.allTransactions, i.data()],
            lastTransaction: i
          });
        });
      });
  };

  fetchMoreTransaction=async(text)=>
  {
     var enterText = text.toUpperCase().split("");
     text = text.toUpperCase();

     const {lastTransaction,allTransactions} = this.state;
     if (!text)
     {
       db.collection('transactions')
       .startAfter(lastTransaction)
      .limit(10)
      .get()
      .then((data) => {
        data.docs.map((i) => {
          this.setState({
            allTransactions: [...this.state.allTransactions, i.data()],
            lastTransaction: i
          });
        });
      });
     }
     if (enterText[0] == "B")
     {
       const rand = await db
       .collection("transactions")
       .where("book_id","==",text)
       .startAfter(lastTransaction)
       .limit(10)
       .get()
       rand.docs.map((i)=>{
         this.setState({
           allTransactions: [...this.state.allTransactions, i.data()],
           lastTransaction: i
         })
       })
     } 
     if (enterText[0] == "S")
     {
       const rand = await db
       .collection("transactions")
       .where("student_id","==",text)
       .startAfter(lastTransaction)
       .limit(10)
       .get()
       rand.docs.map((i)=>{
         this.setState({
           allTransactions: [...this.state.allTransactions, i.data()],
           lastTransaction: i
         })
       })
     }
  }

  handleSearch=async(text)=>
  {
     var enterText = text.toUpperCase().split("");
     text = text.toUpperCase();
     this.setState({allTransactions: []});
     if (!text) 
     {
       this.getTransactions();
     }
     if (text.charAt(0) == "B")
     {
       db.collection("transactions")
       .where("book_id","==",text)
       .limit(10)
       .get()
       .then((data)=>{
         data.docs.map((i)=>{
          this.setState({
            allTransactions: [...this.state.allTransactions, i.data()],
            lastTransaction: i
          })
         })
       })
     } else if (text.charAt(0) == "S")
     {
       db.collection("transactions")
       .where("student_id","==",text)
       .limit(10)
       .get()
       .then((data)=>{
         data.docs.map((i)=>{
           this.setState({
            allTransactions: [...this.state.allTransactions, i.data()],
            lastTransaction: i
          })
         })
       })
     } else 
     {
       alert("This is not a valid student or book")
     }
  }

  renderItem = ({ item, i }) => {
    var date = item.date.toDate().toString().split(' ').splice(0, 4).join(' ');

    var transactionType =
      item.transaction_type == 'issue' ? 'issued' : 'returned';
    return (
      <View style={{ borderWidth: 1 }}>
        <ListItem key={i} bottomDivider>
          <Icon name={'book'} size={40} type={'antdesign'} />
          <ListItem.Content>
            <ListItem.Title style={styles.title}>
              {`${item.book_name} (${item.book_id})`}
            </ListItem.Title>
            <ListItem.Subtitle style={styles.subtitle}>
              {`This book was ${transactionType} by ${item.student_name} (${item.student_id})`}
            </ListItem.Subtitle>

            <View style={styles.lowerLeftContainer}>
              <View style={styles.transactionContainer}>
                <Text
                  style={[
                    styles.transactionText,
                    {
                      color:
                        item.transaction_type == 'issue'
                          ? '#78D304'
                          : '#0364F4',
                    },
                  ]}>
                  {item.transaction_type.charAt(0).toUpperCase() +
                    item.transaction_type.slice(1)}
                </Text>
                <Icon
                  name={
                    item.transaction_type == 'issue'
                      ? 'checkmark-circle-outline'
                      : 'arrow-redo-circle-outline'
                  }
                  type={'ionicon'}
                  color={
                    item.transaction_type == 'issue' ? '#78D304' : '#0364F4'
                  }
                />
              </View>
              <Text style={styles.date}>{date}</Text>
            </View>
          </ListItem.Content>
        </ListItem>
      </View>
    );
  };

  componentDidMount = async () => {
    this.getTransactions();
  };

  render() {
    const { allTransactions, searchText } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.upperContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              onChangeText={(text) => {
                this.setState({
                  searchText: text,
                });
              }}
              placeholder={"Enter book/student ID"}
              placeholderTextColor={"white"}/>
            <TouchableOpacity style={styles.scanButton} onPress={()=>{this.handleSearch(searchText)}}>
              <Text style={styles.scanButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.lowerContainer}>
          <FlatList
            data={allTransactions}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => {
              index.toString();
            }}
            onEndReached = {()=>{
              this.fetchMoreTransaction(searchText)
            }}
            onEndThreshold = {0.9} //or onEndReachedThreshold
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5653D4',
  },
  upperContainer: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  lowerContainer: {
    flex: 0.8,
    backgroundColor: "white"
  },
  textInputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "white",
    flexDirection: "row",
    backgroundColor: "#9DFD24"
  },
  textInput: {
    width: "75%",
    height: 50,
    borderColor: "white",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 20,
    backgroundColor: "#5653D4",
    fontFamily: "raj",
    color: "white",
    padding: 5
  },
  scanButton: {
    width: 70,
    height: 50,
    backgroundColor: "#9DFD24",
    justifyContent: "center",
    alignItems: "center",
  },
  scanButtonText: {
    fontFamily: "raj",
    fontSize: 20,
    color: "black"
  },
  title: {
    fontSize: 15,
    fontFamily: 'raj',
    paddingRight: 100
  },
  subtitle: {
    fontSize: 11,
    fontFamily: 'raj',
  },
  lowerLeftContainer: {
    alignSelf: 'flex-end',
    marginTop: -50,
  },
  transactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  transactionText: {
    fontSize: 15,
    fontFamily: 'raj',
  },
  date: {
    fontSize: 13,
    fontFamily: 'raj',
    paddingTop: 5  
  },
});
