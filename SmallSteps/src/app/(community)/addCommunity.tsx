import { StyleSheet, Text, View } from "react-native";

export default function addCommunity () {
    
    return (
        <View style={styles.addCommunityPageButton}>
            <View style={styles.buttonContent}>
                <Text>Find Community</Text>                
            </View>            
        </View>
    );
}

const styles = StyleSheet.create({
    addCommunityPageButton: {
        borderWidth: 1,
        borderColor: "#333",
        marginHorizontal: 20,
        marginVertical: 20,
        borderRadius: 5,
        backgroundColor: "#f5f5f5"
    },
    buttonContent: {
        flexDirection: "column"
    }
})