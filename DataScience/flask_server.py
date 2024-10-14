from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd

# Create a Flask app
app = Flask(__name__)

# Load the pre-trained KNN model
model = joblib.load('rf_learning_path_model.pkl')

# Define a route for the prediction API
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the JSON data from the request
        data = request.json
        # print(data)
        # Create a DataFrame
        df = pd.DataFrame(data)

        # Explode the learning_path_ids array into individual rows for each learning_path_id
        df = df.explode('learning_path_ids').rename(columns={'learning_path_ids': 'learning_path_id'})

        # Group by 'emp_id' and 'learning_path_id' for aggregation
        grouped_df = df.groupby(['emp_id', 'learning_path_id']).agg(
            avg_completion_rate=('completion_rate', 'mean'),
            avg_test_score_normalized=('test_score_normalized', 'mean'),
            avg_success_rate=('success_rate', 'mean'),
            total_time_spent=('total_time_spent_in_sec', 'mean')
        ).reset_index()

        # Min-Max normalization for total_time_spent
        min_time_spent = grouped_df['total_time_spent'].min()
        max_time_spent = grouped_df['total_time_spent'].max()

        # Avoid division by zero in case all time_spent values are the same
        if max_time_spent == min_time_spent:
            grouped_df['total_time_spent_normalized'] = 0.5  # Assign mid-value if there's no variation
        else:
            grouped_df['total_time_spent_normalized'] = (
                (grouped_df['total_time_spent'] - min_time_spent) /
                (max_time_spent - min_time_spent)
            )

        # Calculate the combined score for each learning path
        grouped_df['combined_score'] = (
            (grouped_df['avg_completion_rate'] * 0.2) +
            (grouped_df['total_time_spent_normalized'] * 0.2) +
            (grouped_df['avg_success_rate'] * 0.15) +
            (grouped_df['avg_test_score_normalized'] * 0.45)
        )

        # Drop intermediate columns now that we have combined_score
        grouped_df.drop(columns=['avg_completion_rate', 'total_time_spent', 'total_time_spent_normalized', 'avg_success_rate', 'avg_test_score_normalized'], inplace=True)

        # Pivot the data to get combined_score for each learning_path_id as a separate column
        pivot_df = grouped_df.pivot(index='emp_id', columns='learning_path_id', values='combined_score')

        # Flatten the MultiIndex columns for easier access
        pivot_df.columns = [f'combined_score_{col}' for col in pivot_df.columns]
        pivot_df.reset_index(inplace=True)
        # Fill NaN values with 0 (if there are any missing values after the pivot)
        pivot_df.fillna(0, inplace=True)
        
        file_path = './rf_predicted_best_learning_paths.csv'  # Update with your actual file path
        df = pd.read_csv(file_path)
        # Fetch the column names from the DataFrame
        required_combined_scores = df.columns[df.columns.str.contains('combined_score_')].tolist()
        # print(required_combined_scores)
        # Create an empty DataFrame for input data with the required combined score columns
        input_data = pd.DataFrame(columns=required_combined_scores)

        # Assign values from pivot_df to input_data
        for col in required_combined_scores:
            if col in pivot_df.columns:
                input_data[col] = pivot_df[col]
            else:
                input_data[col] = 0  # Fill with 0 if column is missing
        # Predict the learning path using the pre-trained model
        prediction = model.predict(input_data)
        # print('prediction: ',prediction)
        # Convert the prediction to a native Python int
        predicted_learning_path_id = int(prediction[0])
        # Return the predicted learning path as a JSON response
        return jsonify({
            'predicted_learning_path_id': predicted_learning_path_id
        })
    
    except Exception as e:
        print("Error: ",e)
        return jsonify({'error': str(e)}), 400

# Run the Flask app
if __name__ == '__main__':
    # Change the port to any other port number, e.g., 8080
    app.run(host='0.0.0.0', port=8080, debug=True)