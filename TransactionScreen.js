import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  ToastAndroid,
  Alert,
} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
const bgimage = require('../assets/background2.png'); //loads the image
const appIcon = require('../assets/appIcon.png');
const appName = require('../assets/appName.png');
import firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      domState: 'normal',
      hasCamPermissions: null,
      scanned: false,
      scannedData: '',
      bookId: '',
      studentId: '',
      bookName: '',
      studentName: '',
    };
  }

  getPermissions = async (domState) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA); //asks for camera permissions
    this.setState({
      //"status == granted" is true when user has granted permission, else false
      hasCamPermissions: status == 'granted',
      domState: domState,
      scanned: false,
    });
  };

  handleBarCodeScan = async ({ type, data }) => {
    const { domState } = this.state;
    if (domState == 'bookId') {
      this.setState({
        bookId: data,
        domState: 'normal',
        scanned: true,
      });
    } else if (domState == 'studentId') {
      this.setState({
        studentId: data,
        domState: 'normal',
        scanned: true,
      });
    }
  };

  handleTransaction = async () => {
    var { bookId, studentId } = this.state;
    await this.getBookDetails(bookId);
    await this.getStudentDetails(studentId);
    var transactionType = await this.checkBookAvailability(bookId);
    if (!transactionType) {
      this.setState({
        bookId: '',
        studentId: '',
      });
      alert('This book does not exist in the library database');
      //for android users only
      ToastAndroid.show(
        'This book does not exist in the library database',
        ToastAndroid.SHORT
      );
      //for ios users
      Alert.alert('This book does not exist in the library database');
    } else if (transactionType == 'issue') {
      var isEligible = await this.checkIssuingEligbility(studentId);
      if (isEligible) {
        var { bookName, studentName } = this.state;
        this.initiateBookIssue(bookId, studentId, bookName, studentName);
        alert('Book issued');
      }
    } else {
      var isEligible = await this.checkReturningEligibility(studentId, bookId);
      if (isEligible) {
        var { bookName, studentName } = this.state;
        this.initiateBookReturn(bookId, studentId, bookName, studentName);
        alert('Book returned');
      }
    }
  };

  componentDidMount() {}

  checkBookAvailability = async (bookId) => {
    bookId = bookId.trim();
    const bookRef = await db
      .collection('books')
      .where('book_id', '==', bookId)
      .get();

    var transactionType = '';
    if (bookRef.docs.length == 0) {
      transactionType = false;
    } else {
      bookRef.docs.map((i) => {
        //if the book is available then transactionType = "issue", else it will be "return"
        transactionType = i.data().is_book_available ? 'issue' : 'return';
      });
    }
    return transactionType;
  };

  checkIssuingEligbility = async (studentId) => {
    studentId = studentId.trim();
    const studentRef = await db
      .collection('students')
      .where('student_id', '==', studentId)
      .get();

    var isStudentEligible = '';
    if (studentRef.docs.length == 0) {
      this.setState({
        bookId: '',
        studentId: '',
      });
      isStudentEligible = false;
      alert('This student does not exist in the library database');
      Alert.alert('This student does not exist in the library database');
    } else {
      studentRef.docs.map((i) => {
        if (i.data().number_of_books_issued < 3) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          alert('This student has already checked out 3 books');
          Alert.alert('This student has already checked out 3 books');
          this.setState({
            bookId: '',
            studentId: '',
          });
        }
      });
    }
    return isStudentEligible;
  };

  checkReturningEligibility = async (studentId, bookId) => {
    studentId = studentId.trim();
    bookId = bookId.trim();
    const returnRef = await db
      .collection('transactions')
      .where('book_id', '==', bookId)
      .limit(1)
      .get();
    console.log(returnRef.docs);
    var isStudentEligible = '';
    returnRef.docs.map((i) => {
      var lastBookTransaction = i.data();
      console.log(lastBookTransaction.student_id);
      if (lastBookTransaction.student_id == studentId) {
        console.log('student eligible');
        isStudentEligible = true;
      } else {
        console.log('student ineligible');
        isStudentEligible = false;
        alert('This student did not check out the book');
        Alert.alert('This student did not check out the book');
        this.setState({
          bookId: '',
          studentId: '',
        });
      }
    });
    return isStudentEligible;
  };

  getBookDetails = (bookId) => {
    bookId = bookId.trim();
    db.collection('books')
      .where('book_id', '==', bookId)
      .get()
      .then((data) => {
        data.docs.map((i) => {
          this.setState({
            bookName: i.data().book_details.book_name,
          });
        });
      });
  };

  getStudentDetails = (studentId) => {
    studentId = studentId.trim();
    db.collection('students')
      .where('student_id', '==', studentId)
      .get()
      .then((data) => {
        data.docs.map((i) => {
          this.setState({
            studentName: i.data().student_details.student_name,
          });
        });
      });
  };

  initiateBookIssue = async (bookId, studentId, bookName, studentName) => {
    //adding a new record in the transaction collection
    db.collection('transactions').add({
      book_id: bookId,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      student_id: studentId,
      student_name: studentName,
      transaction_type: 'issue',
    });
    //changing the book status
    db.collection('books').doc(bookId).update({
      is_book_available: false,
    });
    //changing the issued books per student
    db.collection('students')
      .doc(studentId)
      .update({
        number_of_books_issued: firebase.firestore.FieldValue.increment(1),
      });
    //updating the local variable for the book and student id
    this.setState({
      bookId: '',
      studentId: '',
    });
  };

  initiateBookReturn = async (bookId, studentId, bookName, studentName) => {
    db.collection('transactions').add({
      book_id: bookId,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      student_id: studentId,
      student_name: studentName,
      transaction_type: 'return',
    });
    db.collection('books').doc(bookId).update({
      is_book_available: true,
    });
    db.collection('students')
      .doc(studentId)
      .update({
        number_of_books_issued: firebase.firestore.FieldValue.increment(-1),
      });
    this.setState({
      bookId: '',
      studentId: '',
    });
  };

  render() {
    const {
      domState,
      hasCamPermissions,
      scanned,
      scannedData,
      bookId,
      studentId,
    } = this.state;
    if (domState != 'normal') {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScan}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ImageBackground source={bgimage} style={styles.bgimage}>
          <View style={styles.upperContainer}>
            <Image source={appIcon} style={styles.appIcon} />
            <Image source={appName} style={styles.appName} />
          </View>
          <View style={styles.lowerContainer}>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                onChangeText={(text) => {
                  this.setState({ bookId: text });
                }}
                placeholder={'Book Id'}
                placeholderTextColor={'white'}
                value={bookId}></TextInput>
              <TouchableOpacity
                style={styles.textInputButton}
                onPress={() => {
                  this.getPermissions('bookId');
                }}>
                <Text style={styles.scanButtonText}>Scan</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.textInputContainer, { marginTop: 15 }]}>
              <TextInput
                style={styles.textInput}
                onChangeText={(text) => {
                  this.setState({ studentId: text });
                }}
                placeholder={'Student Id'}
                placeholderTextColor={'white'}
                value={studentId}></TextInput>
              <TouchableOpacity
                style={styles.textInputButton}
                onPress={() => {
                  this.getPermissions('studentId');
                }}>
                <Text style={styles.scanButtonText}>Scan</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                this.handleTransaction();
              }}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5653D4',
  },
  lowerContainer: {
    alignItems: 'center',
    flex: 0.5,
    padding: 20,
  },
  upperContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
    height: 60,
    backgroundColor: '#F48D20',
    borderRadius: 15,
    marginTop: 15,
  },
  submitButtonText: {
    fontSize: 25,
    fontFamily: 'raj',
    color: 'white',
  },
  textInput: {
    borderWidth: 3,
    borderRadius: 10,
    width: '60%',
    height: 50,
    padding: 10,
    borderColor: 'white',
    fontSize: 25,
    backgroundColor: '#5356D4',
    fontFamily: 'raj',
    color: 'white',
  },
  textInputButton: {
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00B9B0',
    textAlign: 'center',
  },
  textInputContainer: {
    backgroundColor: '#00B9B0',
    borderColor: 'white',
    borderRadius: 10,
    borderWidth: 2,
    flexDirection: 'row',
  },
  scanButtonText: {
    fontSize: 25,
    fontFamily: 'raj',
    color: '#0A0101',
  },
  bgimage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  appIcon: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginTop: 80,
  },
  appName: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 50,
  },
});
