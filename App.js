import { StyleSheet, Text, View, ActivityIndicator, FlatList, Linking, Image, TouchableWithoutFeedback,SafeAreaView, StatusBar, Fragment  } from 'react-native';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Card, Button, Icon } from 'react-native-elements';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { render } from 'react-dom';




const filterForUniqueArticles = arr => {
  const cleaned = [];
  arr.forEach(itm => {
    let unique = true;
    cleaned.forEach(itm2 => {
      const isEqual = JSON.stringify(itm) === JSON.stringify(itm2);
      if (isEqual) unique = false;
    });
    if (unique) cleaned.push(itm);
  });
  return cleaned;
};

 export default function App(){
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasErrored, setHasApiError] = useState(false);
  const [lastPageReached, setLastPageReached] = useState(false);


  const getNews = async () => {
    if (lastPageReached) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&apiKey=afdf8df0424f41dca76e8b385c900fd1&page=${pageNumber}`
      );
      const jsonData = await response.json();
      const hasMoreArticles = jsonData.articles.length > 0;
      if (hasMoreArticles) {
      const newArticleList = filterForUniqueArticles(
        articles.concat(jsonData.articles)
      );
      setArticles(newArticleList);
      setPageNumber(pageNumber + 1);
      } else {
      setLastPageReached(true);
    }
    } catch (error) {
      setHasApiError(true);
    }
    setLoading(false);
  };



  if (hasErrored) {
    return (
      <View style={styles.container}>
        <Text>Error =(</Text>
      </View>
    );
  }


  
  const onPress = url => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log(`Don't know how to open URL: ${url}`);
      }
    });
  };

  const renderArticleItem = ({ item }) => {
  return (
    <TouchableWithoutFeedback onPress={() => onPress(item.url)}>
      <View style={styles.card_container}>
      <Image style={StyleSheet.absoluteFill} source={item.urlToImage !==null ? {uri: item.urlToImage} : {uri: 'https://engineering.fb.com/wp-content/uploads/2016/04/yearinreview.jpg'}}/>
      <View style={styles.card_img}>
        <Text style={styles.card_title}>{item.title}</Text>
        <Text style={styles.publish_time}>{moment(item.publishedAt).startOf('hour').fromNow()}</Text>
      </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

  useEffect(() => {
    getNews();
  }, [articles]);


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" loading={loading} />
      </View>
    );
  }
  return (
    <View style={{flex: 1}}>
    <SafeAreaView style={{flex: 0, backgroundColor: '#333'}}/>
    <SafeAreaView style={styles.container} >
      <StatusBar barStyle="light-content" />
      <View style={styles.row}>
        <Text  style={styles.label_title}>Articles Count:</Text>
        <Text style={styles.info_title}>{articles.length}</Text>
      </View>
      <FlatList style={styles.FlatList}
        data={articles}
        onEndReached={getNews} 
        onEndReachedThreshold={1}
        renderItem={renderArticleItem}
        keyExtractor={item => item.title}
        ListFooterComponent={lastPageReached ? <Text style={styles.footer}>No more articles</Text> : <ActivityIndicator
          size="large"
          loading={loading}
        />
        }
        showsVerticalScrollIndicator={false}
      />
      </SafeAreaView>
      </View>
  )
 }


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#333',
    justifyContent: 'center'
  },
  row: {
    flexDirection: 'row'
  },
  label_title: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff'
  },
  info_title: {
    fontSize: 16,
    color: '#fff',
  },
  card_container: {
    width: wp('80%'),
    height: hp('60%'),
    backgroundColor: '#fff',
    marginBottom: 25,
  },
  FlatList: {
    alignSelf: "center",
  },
  card_img: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: '100%',
    height: '100%',
  },
  card_title: {
    position: "absolute",
    bottom: 0,
    color: "#fff",
    fontSize: 20,
    padding: 5,
    width: '100%',
    backgroundColor: '#2239'
  },
  publish_time: {
    fontSize: 10,
    color: "#fff",
    position: "absolute",
    top: 0,
    right: 0,
    padding: 5,
    fontWeight: "bold",
  },
  footer: {
    paddingLeft: wp('25%'),
    paddingBottom: 10,
    color: '#fff',
  }
});
 
