import numpy as np
import tensorflow as tf
import cv2

def generate_gradcam(img_array, model, last_conv_layer_name, class_index=None):
    """
    Generates a Grad-CAM heatmap for a given input image and model.
    
    Parameters:
        img_array (np.ndarray): Preprocessed image input (batch size 1).
        model (tf.keras.Model): The trained model.
        last_conv_layer_name (str): Name of the final convolutional layer in the model.
        class_index (int, optional): Target class index. If None, uses top predicted class.
    
    Returns:
        np.ndarray: 2D normalized heatmap of shape (H, W) in range [0, 1].
    """
    # Build a model that maps input to the activations and final prediction
    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer(last_conv_layer_name).output, model.output]
    )

    # Record operations for automatic differentiation
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        if class_index is None:
            class_index = tf.argmax(predictions[0])
        class_output = predictions[:, class_index]

    # Compute the gradients of the class output w.r.t. conv layer output
    grads = tape.gradient(class_output, conv_outputs)

    # Global average pooling: importance of each feature map channel
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # Weight the feature maps by the pooled gradients
    conv_outputs = conv_outputs[0]  # shape: (H, W, Channels)
    heatmap = tf.reduce_sum(conv_outputs * pooled_grads, axis=-1)

    # ReLU & Normalize to [0, 1]
    heatmap = tf.maximum(heatmap, 0) / (tf.reduce_max(heatmap) + tf.keras.backend.epsilon())

    return heatmap.numpy()


def apply_heatmap_overlay(original_image: np.ndarray, heatmap: np.ndarray, alpha=0.4) -> np.ndarray:
    """
    Overlays a heatmap onto an original image using OpenCV.

    Parameters:
        original_image (np.ndarray): Original image (H, W, 3) in BGR format.
        heatmap (np.ndarray): 2D heatmap in range [0, 1].
        alpha (float): Blending ratio for the heatmap.

    Returns:
        np.ndarray: Blended BGR image with heatmap overlay (uint8).
    """
    # Resize heatmap to match original image size
    heatmap_resized = cv2.resize(heatmap, (original_image.shape[1], original_image.shape[0]))

    # Convert heatmap to color map (Jet) and uint8 format
    heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)

    # Overlay heatmap onto the original image
    overlay = cv2.addWeighted(original_image, 1 - alpha, heatmap_colored, alpha, 0)

    return overlay
